class RangeHelper {
    constructor(data={}) {
      this.data = data;
      this.range_input = {
        //{sheet_name: in_sheet_name, a1_notation:in_cell_notation, letters_not_allowed: ['A'], numbers_not_allowed}
        init_sheet_name: data.sheet_name.toLowerCase(),
        init_a1_notation: data.a1_notation.toUpperCase(),
        one_cell_only: data.one_cell_only,
        letters_not_allowed: data.letters_not_allowed,
        one_cell_only: data.one_cell_only,
        numbers_not_allowed: data.rows_not_allowed,
      };
      this.ss = SpreadsheetApp.getActiveSpreadsheet();
      this.sheet = this.ss.getSheetByName(this.range_input.init_sheet_name);
      this.letter = get_column_letter(this.range_input.init_a1_notation)
      this.number = get_column_number(this.range_input.init_a1_notation)
      this.init_cell_value = get_single_cell_value(this.sheet, this.initial_a1_notation)
    }

    run() {
      early_return()

    }

    early_return() {
      return_early = false
      if (this.range_input.one_cell_only && (':' in this.range_input.init_a1_notation) ) {
        console.log(`Early exit because the ${this.range_input.init_sheet_name} sheet functionality only allows one cell`);
        return_early = true
      }
      this.range_input.letters_not_allowed.forEach((not_allowed_letter) => {
        if (this.letter == not_allowed_letter) {
          console.log(`Early exit because ${this.letter} is in the ${this.range_input.init_sheet_name} sheet letters not allowed`);
          return_early = true
        }
      })
      this.range_input.numbers_not_allowed.forEach((number) => {
        if (this.letter == not_allowed_letter) {
          console.log(`Early exit because ${this.number} is in the ${this.range_input.init_sheet_name} sheet numbers not allowed`);
          return_early = true
        }

      })
    }

    run_expense_dropdown() {
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
      // true means that failure of validation will warn, but still allow
      const rule = SpreadsheetApp.newDataValidation()
                    .requireValueInRange(ss.getRangeByName(range_name), true)
                    .build();
      expense_sheet.getRange(row_and_col.row,row_and_col.col+1).setDataValidation(rule);

    }

    run_dropdowns_sheet_edit() {
       if (cell_notation.includes(':')) {
        Logger.log('exit without error with cell_notation == ' + cell_notation)
        return;
      } else { Logger.log(`in match_named_range_to_dd, cell_notation == ${cell_notation}`) }
      const cell_notation = in_notation.toUpperCase()
      const sheet_name = in_sheet_name.toLowerCase()
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
      edit_named_range({sheet: dropdown_sheet, range_name: range_name, start_row: start_nums.row,
                        start_col: start_nums.col, num_rows: num_rows, num_cols: num_cols})
      if (letter == 'A'){
        append_header_column(dropdown_sheet, range_name)
      }
    }

    get_single_cell_value(sheet, cell_notation) {
      const value = sheet.getRange(cell_notation).getValue(); // Single API call
      return value;
    }

    input_for_get_range_using_ss({a1_notation = null, name = null} = {}) {
      if (a1_notation != null) {
        if (name != null) { console.error('Error: parameters wrong for input_for_get_range_using_ss: either a1_notation or name must be null') }
        return a1_notation
      }
      if (name != null) { return name }
      console.error('Error: parameters wrong for input_for_get_range_using_ss: both a1_notation && name are null, need one of them')
    }


    input_for_get_range({a1_notation = null, row = null, col = null, num_rows = null, num_cols = null} = {}) {
      if (a1_notation != null) {
        return a1_notation
      }
      if (row == null || col == null) {
        console.error(`Error: either col: ${col} or row: ${row} is null for input_for_get_range()`);
      }
      if (num_rows != null && num_cols != null ) {
        return {row: null, col: null, num_rows: null, num_cols: null}
      }
      if (num_cols == null ) {
        return {row: row, col: col, num_rows: num_rows}
      }
      if (num_rows == null ) {
        return {row: row, col: col}
      }
      console.error('Error: parameters wrong for input_for_get_range: {a1_notation = null, row = null, col = null, num_rows = null, num_cols = null} = {}')
    }

    does_key_exist(key, obj) {
      if (key in obj) { return true }
      if (!(key in obj)) { return false }
    }

    get_single_cell_value(sheet, cell_notation) {
      const value = sheet.getRange(cell_notation).getValue(); // Single API call
      return value;
    }


    get_column_letter(cell_notation) {
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

    get_column_number(cell_notation) {
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

    edit_named_range({sheet, range_name, start_row=2, start_col, num_rows=1, num_cols=1} = {}) {
      const ss = SpreadsheetApp.getActive();
      // const named_range = ss.getRangeByName(range_name);
      let new_range = null;
      new_range = sheet.getRange(start_row, start_col, num_rows, num_cols);
      ss.setNamedRange(range_name, new_range);
    }

    find_rows_in_range(dropdown_sheet, cell_notation, start=2, max_num=36) {
      const letter = get_column_letter(cell_notation)
      const notation = `${letter}${start}:${letter}${max_num}`
      Logger.log('in find rows in range, notation is ' + notation)
      const range = dropdown_sheet.getRange(notation);
      Logger.log('in find rows in range, temp range is ' + range.getA1Notation())
      const values = range.getValues();

      const num_rows = values.filter(String).length;
      Logger.log('in find rows in range, in find =_rows_in_range, num_rows == ' + num_rows);
      return num_rows
    }

    find_number_of_columns(sheet, notation) {
      // Get all values from the specified row up to the maximum column possible
      const range = sheet.getRange(notation)
      let values = range.getValues()[0]; // getValues() returns a 2D array, so access the first (and only) row

      // Filter the array to count non-empty cells
      var last_column = values.filter(String).length;

      // Return the count of non-empty columns
      return last_column;
    }

    log_row_and_column(sheet, start_notation) {
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



    get_last_value_in_dd_header(sheet) {
      const last_col = sheet.getLastColumn();
      Logger.log('in get_last_value_in_dd_header, last_col: ' + header_value);
      const header_cell = sheet.getRange(1, lastCol);
      const header_value = headerCell.getValue();
      Logger.log('in get_last_value_in_dd_header, column header: ' + header_value);
      return header_value;
    }

    get_last_value_in_dd_header(sheet) {
      const last_col = sheet.getLastColumn();
      const header_cell = sheet.getRange(1, last_col);
      const header_value = header_cell.getValue();
      return header_value;
    }

    get_last_value_in_category_column() {
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
    append_header_column(dropdown_sheet) {
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
}
