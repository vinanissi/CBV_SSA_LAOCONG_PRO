function dailyHealthCheck() {
  const audit = auditSystem();
  Logger.log('Daily Health Check: ' + JSON.stringify(audit));
}
