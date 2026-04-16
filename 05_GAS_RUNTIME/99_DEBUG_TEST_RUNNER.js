/**
 * CBV Test Runner - Orchestrates all module tests.
 */
function runAllModuleTests() {
  var results = [];
  var hoso = runHoSoTests();
  results.push(hoso);
  var task = runTaskTests();
  results.push(task);
  var finance = runFinanceTests();
  results.push(finance);

  var summary = {
    ok: hoso.ok && task.ok && finance.ok,
    modules: ['HO_SO', 'TASK_CENTER', 'FINANCE'],
    total: hoso.total + task.total + finance.total,
    passed: hoso.passed + task.passed + finance.passed,
    failed: hoso.failed + task.failed + finance.failed,
    details: results
  };

  Logger.log('runAllModuleTests: ' + JSON.stringify(summary, null, 2));
  return summary;
}
