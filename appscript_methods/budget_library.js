/* dropdown makes it so I can add submenus in the next column */
function dropdown(in_notation, in_sheet_name){
  input_data = input_to_range_helper({sheet_name: in_sheet_name, a1_notation: in_notation, expected_letters: ['A']})
  expense_sheet_helper = new RangeHelper(input_data)
  expense_sheet_helper.run()
  Logger.log('Successful completion of expense sheet dropdown code!')
}
// This is specific to dropdown triggers that add new categories and subcategories used in our expense spreadsheet
// It updates the named_range that goes with the dropdown columns
// If you add a new category it adds a new dropdown subcategory header (not necessary to update that named_range)
// If you delete a category, you will need to delete the column
// Deleting a category you need to delete and associated name ranges & fix all the following named_ranges
function match_named_range_to_dd(in_notation, in_sheet_name){
  input_data = input_to_range_helper({sheet_name: in_sheet_name, a1_notation: in_notation, numbers_not_allowed: [1], last_col: 'AJ'})
  dropdown_sheet_helper = new RangeHelper(input_data)
  dropdown_sheet_helper.run()
  Logger.log('Successful completion of dropdown sheet match_named_range_to_dd code!')
}

function input_to_range_helper({sheet_name, a1_notation, one_cell_only=true, expected_letters=[], numbers_not_allowed=[], last_col=''} = {}) {
  return {
    sheet_name: sheet_name,
    a1_notation: a1_notation,
    one_cell_only: one_cell_only,
    expected_letters: expected_letters,
    numbers_not_allowed: numbers_not_allowed,
    last_col: last_col,
    numbers_not_allowed: numbers_not_allowed
  };
}

// this is run from the library and is the first step of starting a new monthly spreadsheet
// MAKE SURE variables have the correct values
function copy_monthly_file() {
  library_values = getLibraryValues()
  // Logger.log(JSON.stringify(library_values)); // Log the values to the Apps Script log
  const folder_id = getValue('folder_id', library_values)
  const copy_id = getValue('copy_id', library_values)
  const new_name = getValue('new_name', library_values)
  ensure_unique_name(folder_id, new_name)
  DriveApp.getFileById(copy_id).makeCopy(new_name, DriveApp.getFolderById(folder_id))
}

function getLibraryValues() {
  const library_spreadsheet = SpreadsheetApp.getActive();
	return library_spreadsheet.getSheetByName('variables').getDataRange().getValues();
}

function getValue(key, library_values) {
  for (let idx = 0; idx < library_values.length; idx++) {
    if (library_values[idx][0] == key) return library_values[idx][1]
  }
  return null
}

// this and the functions it calls are initiated manually from monthly spreadsheet
function clean_old_data(ss, spreadsheet_id, name) {
  if (ss.getId() != spreadsheet_id) {
    throw Error('wrong spreadsheet')
  }
  SpreadsheetApp.setActiveSpreadsheet(ss);
  const expense_sheet = ss.getSheetByName('expenses');
  delete_rows(expense_sheet)
  set_category_validation(ss, expense_sheet)
  set_date_validation(expense_sheet)
  formatDate(expense_sheet)
  formatCurrency(expense_sheet)
  add_annuals(ss, expense_sheet, name)
}

function test_annuals(ss, name) {
  const expense_sheet = ss.getSheetByName('expenses');
  add_annuals(ss, expense_sheet, name)
}

function delete_rows(expense_sheet) {
  const range = expense_sheet.getRange(2, 1, expense_sheet.getMaxRows(), expense_sheet.getMaxColumns());
  // deleting cells also deletes the data validations
  range.deleteCells(SpreadsheetApp.Dimension.COLUMNS);
}

function set_category_validation(ss, expense_sheet) {
  const dropdown_sheet = ss.getSheetByName('dropdowns')
  const category_range = dropdown_sheet.getRange(2,1,dropdown_sheet.getLastRow()-1,1)
  const expense_range = expense_sheet.getRange("A2:A");
  const categories = category_range.getValues().flat();
  const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(categories)
      .build();
  expense_range.setDataValidation(rule);
}

function set_date_validation(expense_sheet) {
  const range = expense_sheet.getRange("C2:C");
  const rule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .build();
  range.setDataValidation(rule);
}

function formatDate(expense_sheet) {
  let column = expense_sheet.getRange("C2:C"); // Column C
  column.setNumberFormat("MM/dd/yyyy");
}

function formatCurrency(expense_sheet) {
  let column = expense_sheet.getRange("D2:D"); // Column D
  column.setNumberFormat("$#,##0.00");
}

function add_annuals(ss, expense_sheet, name) {
  const annuals_sheet = ss.getSheetByName('annuals');
  const data_rows = annuals_sheet.getRange(2,1,annuals_sheet.getLastRow()-1,annuals_sheet.getLastColumn()).getValues();
  const date = make_date(name)
  let target_row = 2
  // var num_rows = data_rows.length;
  // var num_cols = data_rows[0].length + 1;
  for (let idx = 0; idx < data_rows.length; idx++) {
    number = data_rows[idx][2]/12
    row = [[data_rows[idx][0], data_rows[idx][1], date, number]]
    // Logger.log(row)
    range = expense_sheet.getRange(target_row, 1, 1, row[0].length);
    range.setValues(row)
    target_row++
  }
  // Logger.log('date == ' + date)
  // Logger.log('annual rows == ' + data_rows)
  // Logger.log('size of rows == ' + data_rows.length)
  // Logger.log(`annuals_sheet.getLastRow()-1: ${annuals_sheet.getLastRow()-1}`)
  // Logger.log(`annuals_sheet.getLastColumn(): ${annuals_sheet.getLastColumn()}`)
}

function make_date(name) {
  const months = ["January", "February", "March", "April","May", "June", "July", "August","September", "October", "November", "December"];
  let temp = name.split('_')
  year = temp[0]
  month = temp[1]
  let month_num = months.indexOf(month) + 1;
  return `${month_num}/1/${temp[0]}`;
}

function ensure_unique_name(folder_id, new_name) {
  let folder = DriveApp.getFolderById(folder_id); // Replace with your folder ID
  let files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType() === "application/vnd.google-apps.spreadsheet") {
      existing_name = file.getName()
      if (existing_name == new_name) {
        throw new Error(`A file with the name ${new_name} already exists in the folder with id == ${folder_id}`);
      }
    }
  }
}

function _dynamic_named_ranges_from_headers(in_notation, in_sheet_name){
  // {sheet_name, a1_notation, one_cell_only=false, expected_letters=[], numbers_not_allowed=[], last_col=''} = {}
  input_data = input_to_range_helper({sheet_name: in_sheet_name, a1_notation: in_notation, one_cell_only: false})
  dropdown_sheet_helper = new RangeHelper(input_data)
  dropdown_sheet_helper.create_or_edit_ranges_by_col_header()
  Logger.log('Successful completion of dynamic_named_ranges_from_headers!')
}

// input_to_range_helper({sheet_name, a1_notation, one_cell_only=true, expected_letters=[], numbers_not_allowed=[], last_col=''} = {})
function test_misc_range_helper(in_notation, in_sheet_name) {
  Logger.log(`on code.gs, in_notation: ${in_notation}, in_sheet_name; ${in_sheet_name}`)
  named_ranges_tester = new RangeHelper({sheet_name: in_sheet_name, a1_notation: in_notation})
  named_ranges_tester.test_misc_range_helper({sheet_name: in_sheet_name, a1_notation: in_notation})
  Logger.log('Successful completion of test_misc_range_helper!')
}

//function parameters: {sheet_name, a1_notation, one_cell_only=true, expected_letters=[], numbers_not_allowed=[], last_col=''} = {}
function _create_or_edit_named_range(in_notation, in_sheet_name) {
  // ex.call {sheet_name: in_sheet_name, a1_notation'}
  named_ranges_tester = new RangeHelper({sheet_name: in_sheet_name, a1_notation: in_notation})
  named_ranges_tester.create_or_update_named_range()
  Logger.log('Successful completion of create_or_update_named_range code!')
}

/*
{ toString: [Function],
  deleteProperty: [Function],
  deleteAllProperties: [Function],
  getProperty: [Function],
  setProperty: [Function],
  getProperties: [Function],
  setProperties: [Function],
  getKeys: [Function] }
  */
function getLibraryProperty() {
  const scriptProperties = PropertiesService.getScriptProperties();
  console.log(scriptProperties)
}
