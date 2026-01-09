class RangeHelper {
    constructor(data={}) {
      this.data = data;
      this.range_input = {
        init_sheet_name: data.sheet_name.toLowerCase(),
        init_a1_notation: data.a1_notation.toUpperCase(),
        one_cell_only: data.one_cell_only,
      };
      data.a1_notation != '' ? this.a1_notation = `${data.sheet_name.toLowerCase()}!${data.a1_notation.toUpperCase()}` : ''
      this.ss = SpreadsheetApp.getActiveSpreadsheet();
      this.sheet = this.ss.getSheetByName(this.range_input.init_sheet_name);
      data.a1_notation != '' ? this.letter = this.get_column_letter(this.range_input.init_a1_notation) : ''
      data.a1_notation != '' ? this.number = this.get_row_number(this.range_input.init_a1_notation) : ''
      Logger.log(`data_notation: ${this.a1_notation}, this.letter == ${this.letter}, this.number: ${this.number}, sheet: ${this.sheet.getName()}`)
    }

    run() {
      Logger.log(`Right before calling early_return: this.letter == ${this.letter}, this.number: ${this.number}, sheet: ${this.sheet.getName()}`)
      this.early_return(this.sheet.getName())
      if (this.range_input.init_sheet_name == 'expenses') { this.run_expense_dropdown() }
      if (this.range_input.init_sheet_name == 'dropdowns') { this.run_dropdowns_sheet() }
    }

    early_return(sheet_name) {
      if (this.range_input.one_cell_only && (this.range_input.init_a1_notation.includes(':')) ) {
        console.error('input parameters failed validation');
        throw new Error(`Early exit -> the input parameters specify that the ${sheet_name} sheet specifies that ` +
                        `one_cell_only == ${this.range_input.one_cell_only}, but a1_notation: ${this.a1_notation} is > one cell`);
      }
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
      this.create_or_update_named_range()
    }

    create_or_update_named_range() {
      const col_header_notation = `${this.letter}1`
      const col_header = this.get_single_cell_value(col_header_notation)
      Logger.log(`In create_or_update_named_range, this.letter== ${this.letter} col_header == ${col_header}`)
      const header_notation = this.get_header_notation()
      const headers = this.get_headers(header_notation)
      const range_name = col_header.split(' ').join('_').toLowerCase();
      // in function({in_range=null, start=2, max_num=36} = {}) {in_range=null, start=2, max_num=36} = {}
      // from function: this.num_rows_in_column_range({in_range=null, start=2, max_num=36} = {}) {
      let num_rows = this.num_rows_in_column_range()
      if (num_rows < 1) {
        Logger.log(`Need to exit from create_or_update_named_range. No rows besides header. num_rows: ${num_rows}, range_name: ${range_name}`)
        if (this.named_range_exist(range_name)) {
          this.ss.removeNamedRange(range_name);
          Logger.log("Named range, " + range_name + ", deleted.")
        }
        return;
      }
      let col_data_start_notation = `${this.letter}2`
      let start_nums = this.log_row_and_column(col_data_start_notation)
      const num_cols = 1
      // Logger.log('in create_or_update_named_range, col_header_notation == ' + col_header_notation)
      // Logger.log('in create_or_update_named_range, col_data_start_notation == ' + col_data_start_notation)
      // Logger.log('in create_or_update_named_range, col_header == ' + col_header)
      // Logger.log('in create_or_update_named_range, range_name == ' + range_name)
      // Logger.log('in create_or_update_named_range, num_rows == ' + num_rows)
      // Logger.log('in create_or_update_named_range, start_row == ' + start_nums.row)
      // Logger.log('in create_or_update_named_range, start_col == ' + start_nums.col)
      //{sheet=this.sheet, new_range=null, range_name, start_row=2, start_col, num_rows=1, num_cols=1}
      this.edit_named_range({range_name: range_name, start_row: start_nums.row, start_col: start_nums.col,
                             num_rows: num_rows, num_cols: num_cols})
      this.append_header_column(headers)
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
    log_row_and_column(notation=this.a1_notation) {
      Logger.log(`In log row and column, start_notation == ${notation}`)
      const range = this.call_range({a1_notation: notation});
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
      Logger.log(`in call range, row == ${row}`)
      Logger.log(`in call range, col == ${col}`)
      Logger.log(`in call range, num_rows == ${num_rows}`)
      Logger.log(`in call range, num_cols == ${num_cols}`)
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

    edit_named_range({sheet=this.sheet, new_range=null, range_name, start_row=2, start_col, num_rows=null, num_cols=null} = {}) {
      Logger.log(`in edit_named_range, sheet_name is ${sheet.getName()}`)
      Logger.log(`in edit_named_range, range_name is ${range_name}`)
      if (new_range==null){
        new_range = this.call_range({sheet: sheet, row: start_row, col: start_col, num_rows: num_rows, num_cols: num_cols})
      }
      this.ss.setNamedRange(range_name, new_range);
    }

     num_rows_in_column_range({letter=this.letter, start=2, max_num=36} = {}) {
      // Logger.log(`in find rows in range, debugging -- this.letter: ${this.letter}`)
      // Logger.log(`in find rows in range, debugging -- start: ${start}`)
      // Logger.log(`in find rows in range, debugging -- start: ${max_num}`)
      let notation = `${letter}${start}:${letter}${max_num}`
      Logger.log('in find rows in range, in find rows in range, notation is ' + notation)
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

    append_header_column(headers) {
      const new_col_name = this.get_last_value_in_category_column()
      Logger.log('new_col_name == ' + new_col_name)
      const sub_array = headers.filter(str => str.includes(new_col_name));
      Logger.log(`sub_array.length: ${sub_array.length}`)
      Logger.log(`headers: ${headers}`)
      if (sub_array.length > 0) {
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

    create_or_edit_ranges_by_col_header() {
      // Assume headers are in the first row (row 1)
      Logger.log(`create_or_edit_ranges_by_col_header, sheet: ${this.sheet}, notation: ${this.a1_notation}, init_a1: ${this.range_input.init_a1_notation}`)
      const header_notation = this.get_header_notation()
      Logger.log(`create_or_edit_ranges_by_col_header, header_notation: ${header_notation}`)
      const headers = this.get_headers(header_notation)
      Logger.log(`values == ${headers}, header length == ${headers.length}`)
      // Iterate through each header/column
      for (let idx = 0; idx < headers.length; idx++) {
        let header_name = headers[idx].trim();
        Logger.log(`header_name == ${header_name}`)
        // Skip empty headers
        if (header_name === "") {
          continue;
        }
        let range_name = header_name.split(' ').join('_').toLowerCase();
        let start_col = idx + 1
        let current_letter = this.find_current_letter(1, idx + 1)
        Logger.log('following in create_or_edit_ranges_by_col_header:')
        Logger.log (`idx: ${idx} current_letter: ${current_letter}, range_from_col: ${range_name} `)
        // Sanitize the header name to be a valid named range name (e.g., replace spaces with underscores)
        let num_rows = this.num_rows_in_column_range({letter: current_letter})
        Logger.log (`num_rows = ${num_rows}`)
        // Define the range for the data in the current column (starts from row 2 to the last data row)
        // getRange(startRow, startColumn, numRows, numColumns)
        // start_col is defined above
        let start_row = 2;
        let num_cols = 1;
        Logger.log(`row: start_row, col: start_col, num_rows: num_rows, num_cols: 1`)
        // Check if there is data below the header
        if (num_rows > 0) {
          // call_range({sheet = this.sheet, a1_notation = null, row = null, col = null, num_rows = null, num_cols = null} = {})
          let new_range = this.call_range({row: start_row, col: start_col, num_rows: num_rows, num_cols: num_cols})
          // {sheet=this.sheet, new_range=null, range_name, start_row=2, start_col, num_rows=1, num_cols=1}
          this.edit_named_range({sheet: this.sheet, new_range: new_range, range_name: range_name, start_row: 2,
                                start_col: start_col, num_rows: num_rows, num_cols: 1})
        } else if (this.named_range_exist(range_name)) {
          // This method removes the named range association
          this.ss.removeNamedRange(range_name);
          Logger.log("Named range '" + range_name + "' deleted.")
        }
      }
    }

    named_range_exist(range_name) {
      const named_range = this.ss.getRangeByName(range_name);
      if (named_range === null) {
          return false;
      } else {
          return true;
      }
    }

    get_header_notation() {
      let header_notation = this.range_input.init_a1_notation
      const last_col = this.sheet.getLastColumn()
      Logger.log('last_col: ' + last_col)
      const last_letter = this.find_current_letter(1, last_col)
      header_notation += `:${last_letter}1`
      return header_notation
    }

    get_headers(header_notation) {
      const header_range = this.call_range({a1_notation: header_notation});
      const headers = header_range.getValues()[0]
      Logger.log(`values == ${headers}, header length == ${headers.length}`)
      return headers
    }

    find_current_letter(row, col){
      const temp_range = this.call_range({row: row, col: col})
      const temp_notification = temp_range.getA1Notation()
      return this.get_column_letter(temp_notification)
    }

    // Have not made this work on any other ranges than the initial one
    test_misc_range_helper() {
      const num_rows = this.num_rows_in_column_range()
      Logger.log(`find row_nums == ${num_rows}`)
    }
}
