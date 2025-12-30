function onEdit(e){
  const sheet_name = SpreadsheetApp.getActive().getActiveSheet().getName()
  const notation = e.range.getA1Notation()
  if (notation.includes(':')) {
    Logger.log('exit without error with notation == ' + notation)
    return;
  }
  switch(sheet_name) {
    case 'expenses':
      Logger.log('in expenses')
      expenses_on_edit(e);
      break;
    case 'dropdowns':
      Logger.log('in dropdowns')
      dropdowns_on_edit(e);
      break;
    default:
      Logger.log(`no code implemented for onEdit in current sheet: ${sheet_name}`)
  }
}

function expenses_on_edit(e) {
  Logger.log('in expenses')
  budget.dropdown(e.range.getA1Notation(), SpreadsheetApp.getActive().getActiveSheet().getName());
}

function dropdowns_on_edit(e) {
  Logger.log('in dropdowns')
  budget.match_named_range_to_dd(e.range.getA1Notation(), SpreadsheetApp.getActive().getActiveSheet().getName());
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

// the following three functions were only for testing functionaliy or for learning

function test_find_cols_in_range() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('dropdowns');
  num_cols = budget.find_number_of_columns(sheet, 'B1:AJ1')
  Logger.log('number of columns == ' + num_cols)
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
