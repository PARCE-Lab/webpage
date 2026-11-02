# Runs inside Pyodide (see python.worker.js). The worker calls run_script and
# run_tests with the assignment files as JSON and gets JSON back.
import base64
import builtins
import importlib
import io
import json
import os
import runpy
import shutil
import sys
import traceback
import warnings

# Pyodide's default Matplotlib backend draws on a page canvas, which a worker
# doesn't have. Agg renders off-screen; figures are returned as PNGs instead.
os.environ['MPLBACKEND'] = 'Agg'
warnings.filterwarnings('ignore', message='.*non-interactive.*')

WORK = '/home/pyodide/work'


def _no_input(prompt=''):
    # The worker has no keyboard; without this, input() fails with a bare "I/O error".
    raise RuntimeError("input() isn't supported in the grader. Put test values directly in your code.")


builtins.input = _no_input


def _prepare(files_json):
    """Write a fresh copy of the files and forget modules from the last run."""
    for name, module in list(sys.modules.items()):
        if (getattr(module, '__file__', None) or '').startswith(WORK):
            del sys.modules[name]
    os.chdir('/home/pyodide')
    shutil.rmtree(WORK, ignore_errors=True)
    for name, content in json.loads(files_json).items():
        path = os.path.join(WORK, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    os.makedirs(WORK, exist_ok=True)
    os.chdir(WORK)
    if WORK not in sys.path:
        sys.path.insert(0, WORK)
    importlib.invalidate_caches()
    _figures()  # discard figures left open by the previous run


def _figures():
    plt = sys.modules.get('matplotlib.pyplot')
    if plt is None:
        return []
    images = []
    for number in plt.get_fignums():
        buffer = io.BytesIO()
        plt.figure(number).savefig(buffer, format='png', dpi=110, bbox_inches='tight')
        images.append('data:image/png;base64,' + base64.b64encode(buffer.getvalue()).decode())
    plt.close('all')
    return images


def _print_error(error):
    # Skip the runner's own frames so the traceback starts in the student's code.
    tb = error.__traceback__
    while tb and not tb.tb_frame.f_code.co_filename.startswith(WORK):
        tb = tb.tb_next
    traceback.print_exception(type(error), error, tb, file=sys.stderr)
    if isinstance(error, ModuleNotFoundError):
        print(f"\n'{error.name}' isn't available in the browser grader. Available: numpy, pandas, "
              "scikit-learn, scipy, matplotlib, sympy, and the standard library.", file=sys.stderr)


def run_script(files_json, entry):
    _prepare(files_json)
    ok = True
    try:
        # An absolute path, so traceback frames start with WORK (see _print_error).
        runpy.run_path(os.path.join(WORK, entry), run_name='__main__')
    except SystemExit:
        pass
    except BaseException as error:
        ok = False
        _print_error(error)
    return json.dumps({'ok': ok, 'figures': _figures()})


class _Collector:
    """pytest plugin that records each test's outcome and points."""

    def __init__(self):
        self.tests = {}
        self.errors = []

    def pytest_configure(self, config):
        config.addinivalue_line('markers', 'points(n): how many points the test is worth (default 1)')

    def pytest_collection_modifyitems(self, items):
        for item in items:
            marker = item.get_closest_marker('points')
            obj = getattr(item, 'obj', None)
            doc = ((obj.__doc__ if obj is not None else None) or '').strip()
            self.tests[item.nodeid] = {
                'name': doc.splitlines()[0] if doc else item.name,
                'points': marker.args[0] if marker and marker.args else 1,
                'outcome': 'pending',
                'message': '',
            }

    def pytest_collectreport(self, report):
        if report.failed:
            self.errors.append(report.longreprtext)

    def pytest_runtest_logreport(self, report):
        test = self.tests.get(report.nodeid)
        if test is None or test['outcome'] in ('failed', 'error'):
            return
        if report.when == 'call' or not report.passed:
            test['outcome'] = 'error' if report.failed and report.when != 'call' else report.outcome
            test['message'] = report.longreprtext if report.failed else ''


def run_tests(files_json, test_files_json):
    _prepare(files_json)
    import pytest

    collector = _Collector()
    args = ['-q', '--tb=short', '--capture=sys', '-p', 'no:cacheprovider', f'--rootdir={WORK}']
    pytest.main(args + json.loads(test_files_json), plugins=[collector])
    _figures()
    return json.dumps({'tests': list(collector.tests.values()), 'errors': collector.errors})
