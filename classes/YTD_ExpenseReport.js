class YTD_ExpenseReport {
  constructor(data, categories) {
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    this.orig_data = data
    this.categories = categories
    this.current_data = {}
    this.current_title = ''
    this.current_month = ''
    this.current_year = ''
    // processed expense data
    this.expense = {"data": []}
    // controls actual process of creating the expense
    this.loop_through_orig_data_to_prep()
    /**
     * this.orig_data is only used in prepping this.expense.data
     * Nothing with current is used after prep!
     * Everything below is ONLY used after the prep stage: expense_data_to_reports()
     */
    this.saved = {
      month: '',
      month_idx: 0,
      cat_and_subcat: { cat: '', subcat: ''},
      note: ''
    }
    this.accumulators = {
      total: 0.00,
      month: 0.00,
      category: 0.00,
    };
    this.note_accumulator = {
      delim: ' | ',
      notes_string: ''
    }
    this.detail_csv = [['Month', 'Category', 'Subcat', 'Amount']]
    this.notes_csv = [['Month', 'Category', 'Subcat', 'Notes']]
    this.totals_csv = this.initialize_totals_csv_report()
    /**
     * push month totals to month_totals_to_totals_csv during month totals level &&
     * push line to the totals_csv in the totals level
     */
    this.month_totals_to_totals_csv = ['',0,0,0,0,0,0,0,0,0,0,0,0]
  }

  /** this is used in the totals_csv report */
  initialize_totals_csv_report() {
    const header_row = ['Category'].concat(this.months)
    let table = []
    let new_row = []
    table.push(header_row)
    const month_zeros_array = [0,0,0,0,0,0,0,0,0,0,0,0]
    for (let idx = 0; idx < this.categories.length; idx++) {
      new_row = []
      new_row.push(this.categories[idx])
      new_row = new_row.concat(month_zeros_array)
      table.push(new_row)
    }
    // Add row for month totals:
    table.push(['',0,0,0,0,0,0,0,0,0,0,0,0])
    return table
  }

  // The functions before run() are called from the constructor or from a method called in preparation for running
  loop_through_orig_data_to_prep() {
    for (let idx = 0; idx < this.orig_data.length; idx++) {
      // console.error('in loop through orig data, top level, expect idx to be 0 and 1' + idx)
      this.prepare_top_level_data(idx)
      this.current_data = this.current_data[this.current_title]
      // this.print_json_object(this.expense, 'in loop through orig_data to prep, checking out this.expense')
      this.loop_through_rows_for_data_prep(idx)
    }
    this.sort_expense_data()
  }

  // making assumption that the top_level_data is the key (title of spreadsheetd) and the second level will be the rows
  prepare_top_level_data(idx) {
    this.current_data = this.orig_data[idx]
    const keys = Object.keys(this.current_data);
    let title = JSON.stringify(keys)
    this.current_title = JSON.parse(title)[0]
    this.extract_preliminary_fields()
  }

  extract_preliminary_fields() {
    let new_data = { year: 0, month_idx: 0, month: "", rows: []}
    let temp_array = this.current_title.split('_')
    this.current_year = temp_array[0]
    this.current_month = temp_array[1]
    new_data.year = this.current_year
    let month = this.current_month
    new_data.month_idx = this.get_month_idx(this.current_month)
    new_data.month = month
    new_data.rows = []
    this.expense.data.push(new_data)
  }

  loop_through_rows_for_data_prep(top_idx) {
    for (let row_idx = 0; row_idx < this.current_data.length; row_idx++) {
      // debug option
      // if (row_idx > 10) { break;}
      // console.error('expecting numbers from 0-10, 2 times: ' + row_idx )
      this.extract_row_arrays_into_row_hashes(top_idx, row_idx)
    }
  }

  extract_row_arrays_into_row_hashes(top_idx, row_idx) {
    let new_data = {category: '', subcat: "", amount: 0, note: '' }
    new_data.category = this.current_data[[row_idx]][0]
    new_data.subcat = this.current_data[[row_idx]][1]
    new_data.amount = this.current_data[[row_idx]][3]
    new_data.note = this.current_data[[row_idx]][4]
    // this.print_json_object(new_data, 'in extract row arrays, new_data: ')
    // this.print_json_object(this.current_data, 'loop_through_rows_for_data_prep, checking out this.expense')
    // this.print_json_object(this.expense.data, 'in extract row arrays, this.expense_data:')
    this.expense.data[top_idx].rows.push(new_data)
  }

  sort_expense_data() {
    this.expense.data.sort((a, b) => {
      /** Only sort on month if years are not identical. It would actually mess up report processing if there were multiple years,
       * but I like having an example of two field sorting in a semi-complex json object, It would be better programming to not include the year,
       * but it is easier to keep it this way right now
       */
      if (a.year < b.year) return -1;
      if (a.year > b.year) return 1;
      // Sort on name
      if (a.month_idx < b.month_idx) return -1;
      if (a.month_idx > b.month_idx) return 1;
      // Both idential, return 0
      return 0;
    });
  }
  print_json_object(to_print, pre_message){
    console.error(`${pre_message}: ${JSON.stringify(to_print)}`)
  }

  get_month_idx(month) {
    const d = new Date(`${month}-1-2025`);
    return d.getMonth();
  }

  /**
   * Above is prelimary preparation of input data - done in constructor
   * Below is creating three reports using the prepared data: this.expense.data
   */

  /** expense_data_to_reports() - input data was created in the constructor to be exactly what we need: this.expense.data */
  expense_data_to_reports() {
    this.loop_through_data_by_month()
    this.process_total_level()
  }

  /** this controls the month looping (processing depends on the months being sorted in the correct order) */
  loop_through_data_by_month() {
    for (let month_idx = 0; month_idx < this.expense.data.length; month_idx++) {
      for (let row_idx = 0; row_idx < this.expense.data[month_idx].rows.length; row_idx++) {
        let next_detail_row = this.create_detail_row(this.months[month_idx], this.expense.data[month_idx].rows[row_idx])
        if (month_idx != this.saved.month_idx && row_idx != 0 ) {
          // this.print_json_object(this.saved.month_idx, 'in loop_through_months, saved.month_idx: ')
          this.process_month_level()
          this.save_level_variables('month', month_idx, row_idx)
        } else if (month_idx == 0 && row_idx == 0) {
          // console.error('in loop_through_data_by_month, cat and subcat are being assigned right now')
          this.save_level_variables('month', month_idx, row_idx)
        } else {
          this.output_cat_and_subcat_subtotals(month_idx, row_idx)
        }
        this.process_detail(next_detail_row, month_idx, row_idx)
      }
    }
  }

  output_cat_and_subcat_subtotals(month_idx, row_idx) {
    // console.error(`in top of row loop, month_idx: ${month_idx} & row_idx: ${row_idx}`)
    // this.print_json_object(this.expense.data[month_idx].rows[row_idx], 'in top of row loop, input is: ' )
    if (this.saved.cat_and_subcat.cat.length == 0 || this.saved.cat_and_subcat.subcat.length == 0) {
      console.error('Assuming this is the only time that the cat and subcat variable are empty strings ')
      console.error(`output_cat_and_subcat_subtotals(), this.month_idx: ${month_idx}, this.row_idx: ${row_idx}`)
      console.error(`output_cat_and_subcat_subtotals(), this.saved.cat_and_subcat.cat: ${this.saved.cat_and_subcat.cat}`)
      console.error(`output_cat_and_subcat_subtotals(), this.saved.cat_and_subcat.subcat: ${this.saved.cat_and_subcat.subcat}`)
      this.throw_error(`line #: 183, cat or subcat are empty strings at month_idx: ${month_idx}, row_idx: ${row_idx}`)
      return
    }
    if (this.saved.cat_and_subcat.cat != this.expense.data[month_idx].rows[row_idx].category) {
      this.process_category_level()
      this.save_level_variables('category', month_idx, row_idx)
    } else if (this.saved.cat_and_subcat.subcat != this.expense.data[month_idx].rows[row_idx].subcat) {
      this.process_subcat_level()
      this.save_level_variables('subcat', month_idx, row_idx)
    }
  }

  process_detail(next_detail_row, month_idx, row_idx) {
    // if (this.expense.data[month_idx].rows[row_idx].subcat == 'Amazon') {
    //   this.print_json_object(this.expense.data[month_idx].rows[row_idx].category, 'L194, process detail cat: ')
    //   this.print_json_object(this.expense.data[month_idx].rows[row_idx].subcat, 'L195, process detail subcat: ')
    //   this.print_json_object(this.expense.data[month_idx].rows[row_idx].note, 'L196, calling add_note_to_accumulator from process detail')
    // }
    this.add_note_to_accumulator(this.expense.data[month_idx].rows[row_idx].note)
    this.add_amt_to_accumulators(this.expense.data[month_idx].rows[row_idx].amount)
    this.detail_csv.push(next_detail_row)
  }

  create_detail_row(month, input_row) {
    // this.print_json_object(input_row, 'in process_detail_level, input_row: ' )
    let csv_row = []
    csv_row.push(month)
    csv_row.push(input_row.category)
    csv_row.push(input_row.subcat)
    csv_row.push(this.format_currency(input_row.amount))
    return csv_row
  }

  /** this assumes that month category or subcat has changed, write notes for the subcat */
  process_subcat_level() {
    // if (this.saved.cat_and_subcat.subcat == 'Amazon') {
    //   console.error(`Step two, process subcat: ${this.saved.cat_and_subcat.subcat}, cat is ${this.saved.cat_and_subcat.subcat}`)
    //   this.print_json_object(this.note_accumulator.notes_string,'L216 process_subcat_level, note.string about to be pushed: ' )
    // }
    if (this.note_accumulator.notes_string.length == 0) { return }
    let csv_row = [this.saved.month, this.saved.cat_and_subcat.cat, this.saved.cat_and_subcat.subcat, this.note_accumulator.notes_string]
    // if (this.saved.cat_and_subcat.subcat == 'Amazon') {
    //   this.print_json_object(csv_row,'L221 process_subcat_level, notes_csv about to be pushed: ' )
    // }
    this.notes_csv.push(csv_row)
    // if (this.saved.cat_and_subcat.subcat == 'Amazon') {
    //   console.error('in process subcat, setting accumulators to zero')
    // }
    this.set_accumulators_to_zero('subcat')
  }

  process_category_level() {
    if (this.saved.cat_and_subcat.subcat == 'Whole Foods') {
      this.print_json_object(this.saved.cat_and_subcat.subcat, 'in process category, saved subcat: ')
    }
    this.process_subcat_level()
    // update month with category subtotal
    // pass in inner index (column): month_idx + 1
    this.update_totals_csv_with_category_level_amt(this.saved.month_idx + 1)
    // update orig csv with category subtotal line
    let csv_row = [this.saved.month, `${this.saved.cat_and_subcat.cat} SubTTL`, '', this.format_currency(this.accumulators.category)]
    // this.print_json_object(csv_row, 'in process_category level, csv_row is: ')
    this.detail_csv.push(csv_row)
    this.set_accumulators_to_zero('category')
  }

  /**
   * For both update_totals_csv_with_category_level_amt(inner_idx) && update_month_total_in_totals_csv(inner_idx)
   * outer index is always which row
   * inner index is always which column
   */
  update_totals_csv_with_category_level_amt(inner_idx) {
    // inner_idx is the current_month_idx + 1 (for the category columm)
    for (let outer_idx = 0; outer_idx < this.totals_csv.length; outer_idx++) {
      if (this.totals_csv[outer_idx][0] == this.saved.cat_and_subcat.cat) {
        if (this.totals_csv[outer_idx][0] == '') { this.throw_error(`Category: ${this.saved.cat_and_subcat.cat} not found!`)}
        this.totals_csv[outer_idx][inner_idx] = this.format_currency(this.accumulators.category)
        break
      }
    }
  }

  update_month_total_in_totals_csv(inner_idx) {
    // the 1 below is for the headers
    let outer_idx = this.categories.length + 1
    this.totals_csv[outer_idx][inner_idx] = this.format_currency(this.accumulators.month)
  }

  process_month_level() {
    this.print_json_object(this.saved.cat_and_subcat.subcat, 'in process month, saved subcat: ')
    this.process_subcat_level()
    this.process_category_level()
    let csv_row = [`${this.saved.month} SubTTL`, '','',this.format_currency(this.accumulators.month)]
    this.detail_csv.push(csv_row)
    this.update_month_total_in_totals_csv(this.saved.month_idx + 1)
    this.set_accumulators_to_zero('month')
  }

  process_total_level() {
    this.print_json_object(this.saved.cat_and_subcat.subcat, 'in totals, saved subcat: ')
    this.process_month_level()
    let csv_row = [`Total`,'', '',this.format_currency(this.accumulators.total)]
    this.detail_csv.push(csv_row)
  }

  save_level_variables(level, month_idx, row_idx) {
    switch (level) {
      case 'month':
        this.saved.month_idx = month_idx
        this.saved.month = this.expense.data[month_idx].month
      case 'category':
        this.saved.cat_and_subcat.cat = this.expense.data[month_idx].rows[row_idx].category
      case 'subcat':
        this.saved.cat_and_subcat.subcat = this.expense.data[month_idx].rows[row_idx].subcat
    }
  }

  set_accumulators_to_zero(level) {
    // if (this.saved.cat_and_subcat.subcat == 'Amazon') {
    //   console.error('L286,  set_accumulators_to_zero, notestring is back to empty string' )
    // }
    if (level == 'subcat') {this.note_accumulator.notes_string = ''}
    if (level == 'category') {this.accumulators.category = 0.00;}
    if (level == 'month') {this.accumulators.month = 0.00;}
  }

  add_amt_to_accumulators(amount) {
    this.accumulators.category = this.accumulators.category + amount;
    this.accumulators.month = this.accumulators.month + amount;
    this.accumulators.total = this.accumulators.total + amount;
  }

  add_note_to_accumulator(note) {
    note = note.replaceAll(',', ':')
    if (this.note_accumulator.notes_string.length == 0) {this.note_accumulator.notes_string = note}
    else {this.note_accumulator.notes_string += this.note_accumulator.delim + note}
  }

  format_currency(value) {
      return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  get_month_idx(month) {
    const d = new Date(`${month}-1-2025`);
    return d.getMonth();
  }

  throw_error(message){
    throw new Error(message)
  }
}
