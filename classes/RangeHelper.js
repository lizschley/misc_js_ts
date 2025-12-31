class RangeHelper {
    constructor(data={}) {
      this.data = data;
      this.range_input = {
        init_sheet_name: data.sheet_name.toLowerCase(),
        init_a1_notation: data.a1_notation.toUpperCase(),
        one_cell_only: data.one_cell_only,
        expected_letters: data.expected_letters,
        one_cell_only: data.one_cell_only,
        numbers_not_allowed: data.numbers_not_allowed,
      };
      this.a1_notation = `${data.sheet_name.toLowerCase()}!${data.a1_notation.toUpperCase()}`
      this.ss = SpreadsheetApp.getActiveSpreadsheet();
      this.sheet = this.ss.getSheetByName(this.range_input.init_sheet_name);
      this.letter = this.get_column_letter(this.range_input.init_a1_notation)
      this.number = this.get_row_number(this.range_input.init_a1_notation)
      this.init_cell_value = this.get_single_cell_value()
    }

    run() {
      this.early_return()
      if (this.range_input.init_sheet_name == 'expenses') { this.run_expense_dropdown() }
      if (this.range_input.init_sheet_name == 'dropdowns') { this.run_dropdowns_sheet() }
      this.run_expense_dropdown()
    }

    early_return() {
      let return_early = false
      if (this.range_input.one_cell_only && (this.range_input.init_a1_notation.includes(':')) ) {
        console.log(`Early exit because the ${this.range_input.init_sheet_name} sheet functionality only allows one cell`);
        return_early = true
      }
      if (!(this.range_input.expected_letters.includes(this.letter))){
        console.log(`Early exit because ${this.letter} is not expected in the ${this.range_input.init_sheet_name} sheet`);
        return_early = true
      }
      this.range_input.numbers_not_allowed.forEach((not_allowed_number) => {
        if (this.letter == not_allowed_number) {
          console.log(`Early exit because ${this.number} is in the ${this.range_input.init_sheet_name} sheet numbers not allowed`);
          return_early = true
        }
      })
      return return_early
    }

    run_expense_dropdown() {
      if (this.range_input.init_sheet_name != 'expenses') {
        Logger.log('Exiting run_expense_dropdown() because the sheet name is wrong')
        return;
      }
      const row_and_col = this.log_row_and_column(this.sheet, this.range_input.init_a1_notation)
      const cat_val = this.get_single_cell_value(this.sheet, this.range_input.init_a1_notation)
      // Logger.log('cat val == ' + cat_val)
      if (this.sheet.getName() != 'expenses' || cat_val == '') { return; }
      const range_name = cat_val.split(' ').join('_').toLowerCase();
      const named_range = this.ss.getRangeByName(range_name);
      // {sheet = this.sheet, a1_notation = null, row = null, col = null, num_rows = null, num_cols = null}
      // {{row: row_and_col.row, col: row_and_col.col+1}}
      this.call_range({row: row_and_col.row, col: row_and_col.col+1}).clearDataValidations()
      var col_length = named_range.getNumRows();
      Logger.log ('col length == ' + col_length)
      if (col_length < 1) {
        return;
      }
      // true means that failure of validation will warn, but still allow
      const rule = SpreadsheetApp.newDataValidation()
                    .requireValueInRange(ss.getRangeByName(range_name), true)
                    .build();
      this.call_range({row: row_and_col.row, col: row_and_col.col+1}).setDataValidation(rule);

    }

    run_dropdowns_sheet() {
      if (this.range_input.init_sheet_name != 'dropdowns') {
        Logger.log('Exiting run_dropdowns_sheet() because the sheet name is wrong')
        return;
      }

      const col_header_notation = this.letter + '1'
      const col_header_range = this.call_range({a1_notation: col_header_notation})
      const col_header = col_header_range.getValue()
      const range_name = col_header.split(' ').join('_').toLowerCase();
      const num_rows = this.find_rows_in_range()
      const start_nums = log_row_and_column(dropdown_sheet, letter + '2')
      const num_cols = 1
      // Logger.log(`in match_named_range_to_dd, sheetname == ${this.range_input.init_sheet_name}, retrieves ${this.sheet.getName()}`)
      // Logger.log('in match_named_range_to_dd, cell_notation == ' + this.range_input.init_a1_notation)
      // Logger.log('in match_named_range_to_dd, col_header_notation == ' + col_header_notation)
      // Logger.log('in match_named_range_to_dd, col_header == ' + col_header)
      // Logger.log('in match_named_range_to_dd, range_name == ' + range_name)
      // Logger.log('in match_named_range_to_dd, num_rows == ' + num_rows)
      // Logger.log('in match_named_range_to_dd, start_row == ' + start_nums.row)
      // Logger.log('in match_named_range_to_dd, start_col == ' + start_nums.col)
      // Logger.log(`in match_named_range_to_dd, sheetname == ${sheet_name}, retrieves ${dropdown_sheet.getName()}`)
      // Logger.log('in match_named_range_to_dd, cell_notation == ' + cell_notation)
      // Logger.log('in match_named_range_to_dd, col_header_notation == ' + col_header_notation)
      // Logger.log('in match_named_range_to_dd, col_header == ' + col_header)
      // Logger.log('in match_named_range_to_dd, range_name == ' + range_name)
      // Logger.log('in match_named_range_to_dd, num_rows == ' + num_rows)
      // Logger.log('in match_named_range_to_dd, start_row == ' + start_nums.row)
      // Logger.log('in match_named_range_to_dd, start_col == ' + start_nums.col)
      this.edit_named_range({sheet: this.sheet, range_name: range_name, start_row: start_nums.row,
                        start_col: start_nums.col, num_rows: num_rows, num_cols: num_cols})
      if (this.letter == 'A'){
        append_header_column()
      }
    }

    get_single_cell_value() {
      const value = this.call_range({a1_notation: this.a1_notation}).getValue(); // Single API call
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

    get_row_number(cell_notation) {
      Logger.log('in get column_number, cell_notation = ' + cell_notation)
      const temp = cell_notation.split(':')
      const notation = temp[0]
      let number = ''
      for (let idx = 0; idx < notation.length; idx++) {
        if(/^-?\d+$/.test(notation[idx])) {
          number += notation[idx]
        } else {
          continue;
        }
      }
      return number
    }

    log_row_and_column(sheet, start_notation) {
      const range = this.call_range({a1_notation: start_notation}); // any A1 notation works here
      const row = range.getRow();
      const column = range.getColumn();
      Logger.log("Row: " + row + ", Column: " + column);
      return {
        'row': row,
        'col': column
      }
    }

    input_for_get_range_using_ss({a1_notation = null, name = null} = {}) {
      if (a1_notation != null) {
        if (name != null) { console.error('Error: parameters wrong for input_for_get_range_using_ss: either a1_notation or name must be null') }
        return a1_notation
      }
      if (name != null) { return name }
      console.error('Error: parameters wrong for input_for_get_range_using_ss: both a1_notation && name are null, need one of them')
    }


    call_range({sheet = this.sheet, a1_notation = null, row = null, col = null, num_rows = null, num_cols = null} = {}) {
      Logger.log(`sheet == ${sheet.getName()}` )
      Logger.log(`notation == ${a1_notation}` )
      Logger.log(`row ==${row}`)
      Logger.log(`col ==${col}`)
      Logger.log(`num_rows == ${num_rows}`)
      Logger.log(`num_cols == ${num_cols}`)
      if (a1_notation != null) {
        return sheet.getRange(a1_notation)
      }
      if (row == null || col == null) {
        console.error(`Error: either col: ${col} or row: ${row} is null in call_range()`);
        return;
      }
      if (num_rows != null && num_cols != null ) {
        return sheet.getRange(row, col, num_rows, num_cols)
      }
      if (num_rows != null && num_cols == null ) {
        return sheet.getRange(row, col, num_rows)
      }
      if (num_rows == null && num_cols != null) {
        console.error(`Error: No option of numCols when numRows is null; in call_range()`);
        return;
      }
      if (num_rows == null && num_cols == null) {
        return sheet.getRange(row, col)
      }
      console.error(`Error: Invalid input parameters; in call_range()`);
    }

    does_key_exist(key, obj) {
      if (key in obj) { return true }
      if (!(key in obj)) { return false }
    }

    edit_named_range({sheet, range_name, start_row=2, start_col, num_rows=1, num_cols=1} = {}) {
      let new_range = null;
      new_range = this.call_range({row: start_row, col: start_col, num_rows: num_rows, num_cols: num_cols})
      ss.setNamedRange(range_name, new_range);
    }

    find_rows_in_range(start=2, max_num=36) {
      const notation = `${this.letter}${start}:${this.letter}${max_num}`
      Logger.log('in find rows in range, notation is ' + notation)
      const range = this.call_range({a1_notation: notation});
      Logger.log('in find rows in range, temp range is ' + range.getA1Notation())
      const values = range.getValues();

      const num_rows = values.filter(String).length;
      Logger.log('in find rows in range, in find =_rows_in_range, num_rows == ' + num_rows);
      return num_rows
    }

    find_number_of_columns() {
      // Get all values from the specified row up to the maximum column possible
      const range = this.call_range({a1_notation: notation})
      let values = range.getValues()[0]; // getValues() returns a 2D array, so access the first (and only) row

      // Filter the array to count non-empty cells
      var last_column = values.filter(String).length;

      // Return the count of non-empty columns
      return last_column;
    }

    get_last_value_in_dd_header() {
      const last_col = this.sheet.getLastColumn();
      Logger.log('in get_last_value_in_dd_header, last_col: ' + header_value);
      const header_cell = this.call_range({row: 1, col: last_col});
      const header_value = header_cell.getValue();
      Logger.log('in get_last_value_in_dd_header, column header: ' + header_value);
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

    append_header_column() {
        const new_col_name = get_last_value_in_category_column()
        const existing_last_val = get_last_value_in_dd_header()
        Logger.log('new_col_name == ' + new_col_name + ' & existing last col == ' + existing_last_val)
        if (existing_last_val == new_col_name) {
          return;
        }
        const target_row = 1
        const target_col = this.sheet.getLastColumn() + 1
        const cell = this.call_range({row: target_row, col: target_col});
        cell.setValue(new_col_name);
        // Optional: Ensure the changes are applied immediately to the sheet
        // SpreadsheetApp.flush();
        cell.setFontWeight("bold");
      }
}
