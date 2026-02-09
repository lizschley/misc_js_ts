class YTD_ExpenseReport {
    constructor(data, categories) {
      this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      this.orig_data = data
      this.current_data = {}
      this.categories = categories
      // processed expense data
      this.expense = {"data": []}
      // controls actual process of creating the expense
      this.loop_through_orig_data_to_prep()
      this.saved = {
        current_title: '',
        current_month: '',
        current_month_idx: 0,
        current_year: 0,
        saved_category: ''
      }
      this.csv = [['Month', 'Category', 'Subcat', 'Amount']]
      this.totals_csv = this.initialize_totals_csv[['Category'].concat(this.months)]
      this.notes_csv = [['Month', 'Category', 'Subcat', 'Notes']]
      this.accumulators = {
        total: 0.00,
        month: 0.00,
        category: 0.00,
      };
      this.switches = {
        changed_month: true,
        changed_category: true,
        end_of_december: true
      }
    }

    // The functions before run() are called from the constructor or from a method called in preparation for running
    loop_through_orig_data_to_prep() {
      for (let idx = 0; idx < this.orig_data.length; idx++) {
        console.log('in loop through orig data, top level, expect idx to be 0 and 1' + idx)
        this.prepare_top_level_data(idx)
        this.current_data = this.current_data[this.current_title]
        // this.print_json_object(this.expense, 'in loop through orig_data to prep, checking out this.expense')
        this.loop_through_rows_for_data_prep(idx)
        this.print_json_object(this.expense.data, 'test data after end of looping through orig data (10 rows only): ')
      }
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
        // console.log('expecting numbers from 0-10, 2 times: ' + row_idx )
        this.extract_row_arrays_into_row_hashes(top_idx, row_idx)
      }
    }

    extract_row_arrays_into_row_hashes(top_idx, row_idx) {
      let new_data = {category: '', subcat: "", amount: 0, notes: '' }
      new_data.category = this.current_data[[row_idx]][0]
      new_data.subcat = this.current_data[[row_idx]][1]
      new_data.amount = this.current_data[[row_idx]][3]
      new_data.notes = this.current_data[[row_idx]][4]
      // this.print_json_object(new_data, 'in extract row arrays, new_data: ')
      // this.print_json_object(this.current_data, 'loop_through_rows_for_data_prep, checking out this.expense')
      this.print_json_object(this.expense.data, 'in extract row arrays, this.expense_data:')
      this.expense.data[top_idx].rows.push(new_data)
    }

    print_json_object(to_print, pre_message){
      console.log(`${pre_message}: ${JSON.stringify(to_print)}`)
    }

    get_month_idx(month) {
      const d = new Date(`${month}-1-2025`);
      return d.getMonth();
    }

    // run is the beginning of everything after the input data & other data is arranged to make everything clear and run smoothly
    run() {
      this.order_keys_and_process_data();
    }

    order_keys_and_process_data() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      for (let idx = 0; idx < months.length; idx++) {
        var key = this.check_for_month_in_data_key(months[idx])
        if (key) {
          this.done.push(key)
        } else { continue;}
      }
      this.add_totals_row('total')
    }

    // check_for_month_in_data_key(month) {
    //   if (this.month_done.includes(month)) return
    //   for (let process_idx = 0; process_idx < this.data.length; process_idx++) {
    //     if (!this.data[process_idx]) return null
    //     let current_data_with_key = this.data[process_idx]
    //     let key = Object.keys(current_data_with_key).toString()
    //     if (key.includes(month)) {
    //       this.retrieve_data_using_key(current_data_with_key, key)
    //     }
    //   }
    // }

    retrieve_data_using_key(current_data_with_key, key){
      let curr_data = current_data_with_key[key]
      this.current_title = key;
      var temp_array = this.current_title.split('_')
      year = temp_array[0]
      this.current_month = temp_array[1]
      this.process_rows(curr_data)
    }

    process_rows(current_data){
      for (let row_idx = 0; row_idx < current_data.length; row_idx++) {
        let row = []
        row.push(this.current_month)

        let category = current_data[row_idx][0]
        if (category != this.save_category && row_idx !=0) this.add_totals_row('category')
        this.save_category = category
        row.push(category)

        let subcat = current_data[row_idx][1]
        row.push(subcat)

        let amount = this.format_currency(current_data[row_idx][3])
        row.push(amount)
        this.add_row_to_accumulators(current_data[row_idx][3])
        this.csv.push(row)
      }
      this.add_totals_row('category')
      this.save_category = ''
      this.add_totals_row('month')
      this.add_totals_row('total')
    }

    add_totals_row(level){
      let row = ['']
      switch(level) {
        case "category":
          row.push(this.current_month, `${this.save_category} SubTTL`, '', this.format_currency(this.accumulators.category))
          this.add_cat_total_row_csv(this.save_category, this.get_month_idx(this.current_month), this.format_currency(this.accumulators.category))
          console.log('in add totals, accumulators.category: ' + this.accumulators.category)
          this.set_accumulators_to_zero('category')
          console.log('in add totals, after clearing accumulators.category: ' + this.accumulators.category)
          break;
        case "month":
          console.log(`in add_totals_row, month`)
          row.push(`${this.current_month} SubTTL`, '', '', this.format_currency(this.accumulators.month))
          console.log(`in add_totals_row, month, row: ${row}`)
          this.month_subtotals.push(`${this.format_currency(this.accumulators.month)}`)
          this.add_total_month_row_to_csv()
          this.set_accumulators_to_zero('month')
          break;
        case "total":
          row.push('Total', '', '', this.format_currency(this.accumulators.total))
          this.month_subtotals.push(`${this.format_currency(this.accumulators.month)}`)
          this.add_total_month_row_to_csv()
          break;
      }
    }

    set_accumulators_to_zero(level) {
      if (level == 'category') this.accumulators.category = 0.00;
      if (level == 'month') this.accumulators.month = 0.00;
      return
    }

    add_row_to_accumulators(amount) {
      this.accumulators.category = this.accumulators.category + amount;
      this.accumulators.month = this.accumulators.month + amount;
      this.accumulators.total = this.accumulators.total + amount;
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

    category_by_month() {
      let table = {}
      const val = [0,0,0,0,0,0,0,0,0,0,0,0]
      for (let idx = 0; idx < this.categories.length; idx++) {
        table[this.categories[idx]] = val
      }
      return table
    }

  // this.add_cat_total_row_csv(this.save_category, this.get_month_idx(), this.format_currency(this.accumulators.category))
  add_cat_total_row_csv(category, month_idx, value) {
    let row = []
    row.push(category)
    let value_array = this.month_cat_subtotals[category]
    value_array[month_idx] = value
    console.log(`value_array: ${value_array}`)
    this.month_cat_subtotals[category] = value_array
    console.log(`in add_cat_total_row_csv, this.month_cat_subtotals[category] is ${this.month_cat_subtotals[category]}`)
    row = row.concat( this.month_cat_subtotals[category] );
    console.log(`in add_cat_total_row_csv, cat total for ${category} row: ${row}`)
    this.totals_csv.push(row)
  }

  add_total_month_row_to_csv(){
      let new_row = []
      new_row = new_row.concat(this.month_subtotals)
      this.totals_csv.push(new_row)
  }
}
