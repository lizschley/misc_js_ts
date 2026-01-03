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
      data.a1_notation != '' ? this.a1_notation = `${data.sheet_name.toLowerCase()}!${data.a1_notation.toUpperCase()}` : ''
      this.ss = SpreadsheetApp.getActiveSpreadsheet();
      this.sheet = this.ss.getSheetByName(this.range_input.init_sheet_name);
      data.a1_notation != '' ? this.letter = this.get_column_letter(this.range_input.init_a1_notation) : ''
      data.a1_notation != '' ? this.number = this.get_row_number(this.range_input.init_a1_notation) : ''
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
      const row_and_col = this.log_row_and_column()
      const cat_val = this.get_single_cell_value()
      // Logger.log('cat val == ' + cat_val)
      if (this.sheet.getName() != 'expenses' || cat_val == '') { return; }
      const range_name = cat_val.split(' ').join('_').toLowerCase();
      const named_range = this.ss.getRangeByName(range_name);
      // {sheet = this.sheet, a1_notation = null, row = null, col = null, num_rows = null, num_cols = null}
      // {{row: row_and_col.row, col: row_and_col.col+1}}
      this.call_range({row: row_and_col.row, col: row_and_col.col+1}).clearDataValidations()
      if (!named_range) { return; }
      var col_length = named_range.getNumRows();
      Logger.log ('col length == ' + col_length)
      if (col_length < 1) {
        return;
      }
      // true means that failure of validation will warn, but still allow
      const rule = SpreadsheetApp.newDataValidation()
                    .requireValueInRange(this.ss.getRangeByName(range_name), true)
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
      const num_rows = this.find_rows_in_range(this.a1_notation)
      let start_nums = this.log_row_and_column()
      // const edited_value = this.get_single_cell_value(cell_notation)
      const num_cols = 1
      // Logger.log('in match_named_range_to_dd, col_header_notation == ' + col_header_notation)
      // Logger.log('in match_named_range_to_dd, col_header == ' + col_header)
      // Logger.log('in match_named_range_to_dd, range_name == ' + range_name)
      // Logger.log('in match_named_range_to_dd, num_rows == ' + num_rows)
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

    get_single_cell_value(cell_notation=null) {
      let use_notation = this.range_input.init_a1_notation
      if (cell_notation) {use_notation = cell_notation}
      Logger.log(`in get single cell value, using notation == ${use_notation}`)
      const value = this.call_range({a1_notation: use_notation}).getValue(); // Single API call
      Logger.log(`in get single cell value, value type == ${typeof(value)} resulting value == ${value}`)
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

    // this depends on current usage - we can count on cell_notation equaling one cell only
    log_row_and_column() {
      Logger.log(`In log row and column, start_notation == ${this.a1_notation}`)
      const range = this.call_range({a1_notation: this.a1_notation});
      const row = range.getRow();
      const column = range.getColumn();
      Logger.log("In log row and column, sheet: " + this.sheet.getName() + ", row == " + row + ", col == " + column);
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

    // decreases time spent looking up parameters for getRange()
    call_range({sheet = this.sheet, a1_notation = null, row = null, col = null, num_rows = null, num_cols = null} = {}) {
      Logger.log(`in call range, sheet == ${sheet.getName()}` )
      Logger.log(`in call range, cell_notation == ${a1_notation}` )
      Logger.log(`in call range,row == ${row}`)
      Logger.log(`in call range,col == ${col}`)
      Logger.log(`in call range,num_rows == ${num_rows}`)
      Logger.log(`in call range,num_cols == ${num_cols}`)
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

    // not used
    does_key_exist(key, obj) {
      if (key in obj) { return true }
      if (!(key in obj)) { return false }
    }

    edit_named_range({range_name, start_row=2, start_col, num_rows=1, num_cols=1} = {}) {
      let new_range = null;
      new_range = this.call_range({row: start_row, col: start_col, num_rows: num_rows, num_cols: num_cols})
      this.ss.setNamedRange(range_name, new_range);
    }

    // this only tested with one column that has a header
    find_rows_in_range(start=2, max_num=36) {
      const notation = `${this.letter}${start}:${this.letter}${max_num}`
      Logger.log('in find rows in range, notation is ' + notation)
      const range = this.sheet.getRange(notation);
      Logger.log('in find rows in range, temp range is ' + range.getA1Notation())
      const values = range.getValues();
      const num_rows = values.filter(String).length;
      Logger.log('in find rows in range, in find =_rows_in_range, num_rows == ' + num_rows);
      return num_rows
    }

    // not used
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
      const header_cell = this.call_range({row: 1, col: last_col});
      const header_value = header_cell.getValue();
      Logger.log('in get_last_value_in_dd_header, last_col: ' + header_value);
      Logger.log('in get_last_value_in_dd_header, column header: ' + header_value);
      return header_value;
    }

    get_last_value_in_category_column() {
      const named_range = this.ss.getRangeByName('categories');
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

    // testing - assumes the range_name is derived from the column header
    create_or_update_named_range() {
      const col_header = this.get_single_cell_value(this.range_input.init_a1_notation)
      Logger.log(`In create_or_update_named_range, letter== ${this.letter} col_header == ${col_header}`)
      const range_name = col_header.split(' ').join('_').toLowerCase();
      // start copy
      const num_rows = this.find_rows_in_range(this.a1_notation)
      let start_nums = this.log_row_and_column()
      const num_cols = 1
      Logger.log('in match_named_range_to_dd, col_header_notation == ' + col_header_notation)
      Logger.log('in match_named_range_to_dd, col_header == ' + col_header)
      Logger.log('in match_named_range_to_dd, range_name == ' + range_name)
      Logger.log('in match_named_range_to_dd, num_rows == ' + num_rows)
      Logger.log('in match_named_range_to_dd, col_header_notation == ' + col_header_notation)
      Logger.log('in match_named_range_to_dd, col_header == ' + col_header)
      Logger.log('in match_named_range_to_dd, range_name == ' + range_name)
      Logger.log('in match_named_range_to_dd, num_rows == ' + num_rows)
      Logger.log('in match_named_range_to_dd, start_row == ' + start_nums.row)
      Logger.log('in match_named_range_to_dd, start_col == ' + start_nums.col)
      this.edit_named_range({sheet: this.sheet, range_name: range_name, start_row: start_nums.row,
                             start_col: start_nums.col, num_rows: num_rows, num_cols: num_cols})
      //end_copy
      // let start_range_notation = `${this.letter}1:${this.letter}100`
      // let col_length = this.get_col_length(start_range_notation)
      // Logger.log(`start_range_notation == ${start_range_notation} & col_length == ${col_length}`)
      // // Define the range for the data in the current column (starts from row 2 to the last data row)
      // // getRange(startRow, startColumn, numRows, numColumns)
      // let start_row = 2;
      // let named_range_notation = `${this.range_input.init_sheet_name}!${this.letter}${start_row}:${this.letter}${col_length}`
      // Logger.log(`named_range_notation == ${named_range_notation} & col_length == ${col_length}`)
      // // Check if there is data below the header
      // if (col_length > 1) {
      //   // new_range.call_range({sheet = this.sheet, a1_notation = null, row = null, col = null, num_rows = null, num_cols = null} = {})
      //   let new_range = this.call_range({a1_notation: named_range_notation})
      //   let named_range = this.ss.getRangeByName(range_name);
      //   if (named_range) {
      //     Logger.log(`updating named range with new_range == ${new_range.getA1Notation()}`)
      //     this.replace_range_in_named_range(named_range, new_range)
      //   } else {
      //     Logger.log(`creating named range with name == ${new_range} & a1_notation == ${new_range.getA1Notation()}`)
      //     this.create_new_named_range(range_name, new_range)
      //   }
      // } else {
      //   Logger.log('no values, therefore not editing or creating named_range')
      // }
    }

    replace_range_in_named_range(named_range, new_range) {
      try {
        named_range.setRange(new_range);
        console.log(`in replace range in named_range, named_range.getName(): ${named_range.getName()} & a1_notation_notation: ${new_range.getA1Notation()}`);
      } catch (e) {
        console.error(`in replace range in named_range, with new a1_notation: ${new_range.getA1Notation()}. Error: ${e.message}`);
      }
    }

    create_new_named_range(range_name, new_range) {
      try {
        this.ss.setNamedRange(range_name, new_range);
        console.log(`In create_new_named_range, name == ${range_name}, a1_notification: ${new_range.getA1Notation()}`);
      } catch (e) {
        console.error(`Could not create named range ${range_name}. Error: ${e.message}`);
      }
    }

    named_ranges_by_col_header(range_name, init_header_row) {
      // Assume headers are in the first row (row 1)
      const header_row = this.sheet.getRange(init_header_row);
      const headers = header_row.getValues()[0];

      // Iterate through each header/column
      for (let idx = 0; idx < headers.length; idx++) {
        let header_name = headers[idx].trim();
        // Skip empty headers
        if (header_name === "") {
          continue;
        }
        // Sanitize the header name to be a valid named range name (e.g., replace spaces with underscores)
        let range_name = header_name.split(' ').join('_').toLowerCase();
        let letter = get_column_letter(headers[idx].getA1Notation())
        let init_a1_notation = `${letter}1:${letter}100`
        let col_length = this.get_col_length(init_a1_notation)
        Logger.log(`With init_a1_notation == ${init_a1_notation}, col_length == ${col_length}`)
        return
        // Define the range for the data in the current column (starts from row 2 to the last data row)
        // getRange(startRow, startColumn, numRows, numColumns)
        let start_row = 2;
        let start_col = idx + 1; // i is 0-indexed, columns are 1-indexed
        let num_rows = col_length
        let num_cols = 1;
        Logger.log(`row: start_row, col: start_col, num_rows: num_rows, num_cols: num_cols`)
        // Check if there is data below the header
        if (num_rows > 1) {
          // call_range({sheet = this.sheet, a1_notation = null, row = null, col = null, num_rows = null, num_cols = null} = {})
          let new_range = this.call_range({row: start_row, col: start_col, num_rows: num_rows, num_cols: num_cols})
          let named_range = this.ss.getRangeByName(range_name);
          if (named_range) {
            replace_range_in_named_range(named_range, new_range)
          } else {
            create_new_named_range(range_name, new_range)
          }
        }
      }
    }

    get_col_length(a1_notation) {
      // get the range you need
      const init_col_range = this.sheet.getRange(a1_notation);
      // Get all values in the column as a 2D array
      const col_values = init_col_range.getValues();
      // Filter the array to remove empty strings and get the length
      // The filter(String) checks if the value, when coerced to a string, is non-empty.
      var col_length = col_values.filter(String).length;
      // Log the result (for testing)
      Logger.log(`The length of data in ${a1_notation} is: ${col_length}`);
      // Return the length, if needed for other parts of your script
      return col_length;
    }
}

