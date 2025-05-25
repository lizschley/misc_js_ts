function onEdit(e){
    var a1 = e.range.getA1Notation();
    console.log(`a1 == ${a1}`);
    budget.dropdown(a1);
  }

  function onOpen() {
    const ss = SpreadsheetApp.getActive();
    const menu = [{ name: 'Sort By Date', functionName: 'sort_date'}]
    ss.addMenu('Custom', menu);
  }

  function sort_date() {
    const ss = SpreadsheetApp.getActive();
    const expense_sheet = ss.getSheetByName('expenses');
    let month_range = expense_sheet.getRange(2,1,expense_sheet.getLastRow()-1,5)
    month_range.sort([
      {column: 3, ascending: true}
    ]);
    date_range = expense_sheet.getRange('C2:C');
    date_range.sort({column: 3, ascending: true});
  }

  // DO NOT RUN THIS UNLESS THIS IS A COPIED SPREADSHEET
  // IT WILL DESTROY DATA
  function clean_prior_data(){
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const name = ss.getName()
    const spreadsheet_id = ss.getId()
    budget.clean_old_data(ss, spreadsheet_id, name)
  }

  function test_annuals() {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const name = ss.getName()
    budget.test_annuals(ss, name)
  }

  // just for learning (final underscore in function name prevents it from showing up in dd list)
  function getValidationRule_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = ss.getSheetByName('expenses')
    const range = sheet.getRange('C2:C')
    const rule = range.getDataValidation()
    if (rule != null) {
      const criteria = rule.getCriteriaType();
      const args = rule.getCriteriaValues();
      Logger.log('The data validation rule is %s %s', criteria, args);
    } else {
      Logger.log('The cell does not have a data validation rule.');
    }
  }
