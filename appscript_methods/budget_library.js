/* dropdown makes it so I can add submenus in the next column */
function dropdown(cell_notation, sheet_name){
  Logger.log(`in budget dropdown, cell_notation == ${cell_notation}`)
  const letter = get_column_letter(cell_notation)
  if (letter != 'A') { return; }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const expense_sheet = ss.getSheetByName(sheet_name);
  const row_and_col = log_row_and_column(expense_sheet, cell_notation)
  Logger.log(`row == ${log_row_and_column.row} and col == ${log_row_and_column.col}`)
  const cat_val = get_single_cell_value(expense_sheet, cell_notation)
  Logger.log('cat val == ' + cat_val)
  if (expense_sheet.getName() != 'expenses' || cat_val == '') { return; }
  const range_name = cat_val.split(' ').join('_').toLowerCase();
  const named_range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(range_name);
  expense_sheet.getRange(row_and_col.row,row_and_col.col+1).clearDataValidations()
  var col_length = named_range.getNumRows();
  Logger.log ('coll length == ' + col_length)
  if (col_length < 1) {
    return;
  }
  const rule = SpreadsheetApp.newDataValidation()
                .requireValueInRange(ss.getRangeByName(range_name), true)
                .build();
  expense_sheet.getRange(row_and_col.row,row_and_col.col+1).setDataValidation(rule);
}

// cell_notation designed for single cell only
// Untested for > 1 cell
function get_single_cell_value(sheet, cell_notation) {
  const value = sheet.getRange(cell_notation).getValue(); // Single API call
  return value;
}

// This is specific to dropdown triggers that add new categories and subcategories used in our expense spreadsheet
// It updates the named_range that goes with the dropdown columns
// If you add a new category it adds a new dropdown subcategory header (not necessary to update that named_range)
// If you delete a category, you will need to delete the column
// Deleting a category you need to delete and associated name ranges & fix all the following named_ranges
function match_named_range_to_dd(cell_notation, sheet_name){
  const number = get_column_number(cell_notation)
  if (number == '1') { return; }
  const letter = get_column_letter(cell_notation)
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dropdown_sheet = ss.getSheetByName(sheet_name);
  const col_header_notation = letter + '1'
  const col_header_range = dropdown_sheet.getRange(col_header_notation)
  const col_header = col_header_range.getValue()
  const range_name = col_header.split(' ').join('_').toLowerCase();
  const num_rows = find_rows_in_range(dropdown_sheet, cell_notation)
  const start_nums = log_row_and_column(dropdown_sheet, letter + '2')
  const num_cols = 1
  Logger.log(`in match_named_range_to_dd, sheetname == ${sheet_name}, retrieves ${dropdown_sheet.getName()}`)
  Logger.log('in match_named_range_to_dd, cell_notation == ' + cell_notation)
  Logger.log('in match_named_range_to_dd, col_header_notation == ' + col_header_notation)
  Logger.log('in match_named_range_to_dd, col_header == ' + col_header)
  Logger.log('in match_named_range_to_dd, range_name == ' + range_name)
  Logger.log('in match_named_range_to_dd, num_rows == ' + num_rows)
  Logger.log('in match_named_range_to_dd, start_row == ' + start_nums.row)
  Logger.log('in match_named_range_to_dd, start_col == ' + start_nums.col)
  Logger.log('in match_named_range_to_dd, start_nums == ' + start_nums)
  Logger.log('in match_named_range_to_dd, start_row == ' + start_nums.row)
  Logger.log('in match_named_range_to_dd, start_col == ' + start_nums.col)
  edit_named_range({sheet: dropdown_sheet, range_name: range_name, start_row: start_nums.row,
                    start_col: start_nums.col, num_rows: num_rows, num_cols: num_cols})
  if (letter == 'A'){
    append_header_column(dropdown_sheet, range_name)
  }
}

function get_column_letter(cell_notation) {
  let letter = ''
  for (let idx = 0; idx < cell_notation.length; idx++) {
    if(/^-?\d+$/.test(cell_notation[idx])) {
      break;
    } else {
      letter += cell_notation[idx]
    }
  }
  return letter
}

function get_column_number(cell_notation) {
  Logger.log('in get_column_number, cell_notation = ' + cell_notation)
  const temp = cell_notation.split(':')
  const notation = temp[0]
  let number = ''
  Logger.log('in get_column_number, notation == ' + notation)
  for (let idx = 0; idx < notation.length; idx++) {
    if(/^-?\d+$/.test(notation[idx])) {
      number += notation[idx]
    } else {
      continue;
    }
  }
  return number
}

function edit_named_range({sheet, range_name, start_row=2, start_col, num_rows=1, num_cols=1} = {}) {
  const ss = SpreadsheetApp.getActive();
  // const named_range = ss.getRangeByName(range_name);
  let new_range = null;
  new_range = sheet.getRange(start_row, start_col, num_rows, num_cols);
  ss.setNamedRange(range_name, new_range);
}

function find_rows_in_range(dropdown_sheet, cell_notation, start=2, max_num=36) {
  const letter = get_column_letter(cell_notation)
  const notation = `${letter}${start}:${letter}${max_num}`
  Logger.log('in find rows in range, notation is ' + notation)
  const range = dropdown_sheet.getRange(notation);
  Logger.log('in find rows in range, temp range is ' + range.getA1Notation())
  const values = range.getValues();
  Logger.log('values == ' + values);
  const num_rows = values.filter(String).length;
  Logger.log('in find rows in range, in find =_rows_in_range, num_rows == ' + num_rows);
  return num_rows
}

function find_number_of_columns(sheet, notation) {
  // Get all values from the specified row up to the maximum column possible
  const range = sheet.getRange(notation)
  let values = range.getValues()[0]; // getValues() returns a 2D array, so access the first (and only) row

  // Filter the array to count non-empty cells
  var last_column = values.filter(String).length;

  // Return the count of non-empty columns
  return last_column;
}

function log_row_and_column(sheet, start_notation) {
  Logger.log('in log_row_and_column, start notation == ' + start_notation)
  sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange(start_notation); // any A1 notation works here
  const row = range.getRow();
  const column = range.getColumn();
  Logger.log("Row: " + row + ", Column: " + column);
  return {
    'row': row,
    'col': column
  }
}

function append_header_column(dropdown_sheet) {
  if (!dropdown_sheet) {
    throw new Error(`Sheet named dropdown_sheet was not found.`);
  }
  const new_col_name = get_last_value_in_category_column()
  const existing_last_val = get_last_value_in_dd_header(dropdown_sheet)
  Logger.log('new_col_name == ' + new_col_name + ' & existing last col == ' + existing_last_val)
  if (existing_last_val == new_col_name) {
    return;
  }
  const target_row = 1
  const target_col = dropdown_sheet.getLastColumn() + 1
  const cell = dropdown_sheet.getRange(target_row, target_col);
  cell.setValue(new_col_name);
  // Optional: Ensure the changes are applied immediately to the sheet
  // SpreadsheetApp.flush();
  cell.setFontWeight("bold");
}

function get_last_value_in_dd_header(sheet) {
  const last_col = sheet.getLastColumn();
  Logger.log('in get_last_value_in_dd_header, last_col: ' + header_value);
  const header_cell = sheet.getRange(1, lastCol);
  const header_value = headerCell.getValue();
  Logger.log('in get_last_value_in_dd_header, column header: ' + header_value);
  return header_value;
}

function get_last_value_in_dd_header(sheet) {
  const last_col = sheet.getLastColumn();
  const header_cell = sheet.getRange(1, last_col);
  const header_value = header_cell.getValue();
  return header_value;
}

function get_last_value_in_category_column() {
  const ss = SpreadsheetApp.getActive();
  const named_range = ss.getRangeByName('categories');
  if (!named_range) {
    Logger.log(`Error: Named range categories not found.`);
    return null;
  }
  const values = named_range.getValues();
  Logger.log('in get_last_value_in_category_column, values == ' + values);
  const last_row_idx = values.filter(String).length - 1;
  Logger.log('in get_last_value_in_category_column, last rows idx == ' + last_row_idx)
  const last_value = values[last_row_idx];
  Logger.log('in get_last_value_in_category_column, value == ' + last_value)
  return last_value
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
  var num_rows = data_rows.length;
  var num_cols = data_rows[0].length + 1;
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
