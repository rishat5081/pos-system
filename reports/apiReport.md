# Api Execution Report

Generated At: 2026-03-15T14:31:15.245Z
Total APIs: 17
Passed: 17
Failed: 0

| Api | Status | Duration (ms) | Detail |
| --- | --- | ---: | --- |
| auth.login.invalidCredentials | PASSED | 58.359 | expected error: Invalid username or password |
| auth.login.validCredentials | PASSED | 45.239 | ok (object result) |
| auth.getSession | PASSED | 0.016 | ok (object result) |
| auth.logout | PASSED | 0.007 | ok (object result) |
| store.addCategory | PASSED | 0.162 | ok (5) |
| store.addProduct | PASSED | 0.138 | ok (5) |
| store.addCustomer | PASSED | 0.119 | ok (3) |
| store.processCheckout.closedRegisterValidation | PASSED | 0.168 | expected error: Open register session before checkout |
| store.startRegisterSession | PASSED | 0.065 | ok (object result) |
| store.processCheckout | PASSED | 0.404 | ok (object result) |
| store.adjustStock | PASSED | 0.095 | ok (object result) |
| store.addCustomerCredit | PASSED | 0.130 | ok (90) |
| store.redeemCustomerPoints | PASSED | 0.112 | ok (161) |
| store.toggleAttendance | PASSED | 0.145 | ok (object result) |
| store.addMeeting | PASSED | 0.088 | ok (2) |
| store.repayLoan | PASSED | 0.090 | ok (object result) |
| store.endRegisterSession | PASSED | 0.056 | ok (object result) |
