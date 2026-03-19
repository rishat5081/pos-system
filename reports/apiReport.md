# Api Execution Report

Generated At: 2026-03-19T13:40:56.345Z
Total APIs: 17
Passed: 17
Failed: 0

| Api | Status | Duration (ms) | Detail |
| --- | --- | ---: | --- |
| auth.login.invalidCredentials | PASSED | 66.537 | expected error: Invalid username or password |
| auth.login.validCredentials | PASSED | 76.794 | ok (object result) |
| auth.getSession | PASSED | 0.050 | ok (object result) |
| auth.logout | PASSED | 0.007 | ok (object result) |
| store.addCategory | PASSED | 0.188 | ok (5) |
| store.addProduct | PASSED | 0.114 | ok (5) |
| store.addCustomer | PASSED | 0.105 | ok (3) |
| store.processCheckout.closedRegisterValidation | PASSED | 0.135 | expected error: Open register session before checkout |
| store.startRegisterSession | PASSED | 0.052 | ok (object result) |
| store.processCheckout | PASSED | 0.317 | ok (object result) |
| store.adjustStock | PASSED | 0.075 | ok (object result) |
| store.addCustomerCredit | PASSED | 0.099 | ok (90) |
| store.redeemCustomerPoints | PASSED | 0.092 | ok (161) |
| store.toggleAttendance | PASSED | 0.117 | ok (object result) |
| store.addMeeting | PASSED | 0.070 | ok (2) |
| store.repayLoan | PASSED | 0.069 | ok (object result) |
| store.endRegisterSession | PASSED | 0.044 | ok (object result) |
