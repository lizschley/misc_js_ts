class YTD_ExpenseReport {
    constructor(data) {
      this.data = data;
      this.csv = [['Month', 'Category', 'Subcat', 'Amount']]
      this.totals_csv = [['Category', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']]
      this.month_cat_subtotals = this.category_by_month()
      this.month_subtotals = []
      this.year = 'year from name'
      this.current_title = 'from month keys'
      this.current_month = 'month'
      this.month_done = []
      this.accumulators = {
        total: 0.00,
        month: 0.00,
        category: 0.00,
      };
      this.save_category = '';
    }

    // this will eventually be a way to select report, unless I make this a base class (cleaner?)
    run() {
      // Logger.log(`init - month_cat_subtotals == ${this.month_cat_subtotals}`)
      this.order_keys_and_process_data();
      this.create_totals_csv()
    }

    order_keys_and_process_data() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      for (let idx = 0; idx < months.length; idx++) {
        var key = this.check_for_month_in_data_key(months[idx])
        if (key)
          this.done.push(key)
        else { continue;}
      }
      this.add_totals_row('total')
    }

    check_for_month_in_data_key(month) {
      if (this.month_done.includes(month)) return
      for (let process_idx = 0; process_idx < this.data.length; process_idx++) {
        if (!this.data[process_idx]) return null
        let current_data_with_key = this.data[process_idx]
        let key = Object.keys(current_data_with_key).toString()
        if (key.includes(month)) {
          this.retrieve_data_using_key(current_data_with_key, key)
        }
      }
    }

    retrieve_data_using_key(current_data_with_key, key){
      let curr_data = current_data_with_key[key]
      this.current_title = key;
      var temp_array = this.current_title.split('_')
      this.year = temp_array[0]
      this.current_month = temp_array[1]
      this.process_rows(curr_data)
    }

    process_rows(current_data) {
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
    }

    add_totals_row(level){
      let row = []
      switch(level) {
        case "category":
          row.push(this.current_month, `${this.save_category} SubTTL`, '', this.format_currency(this.accumulators.category))
          // Logger.log(`save_category == ${this.save_category} & get_month_idx() == ${this.get_month_idx()}`)
          this.month_cat_subtotals[this.save_category][this.get_month_idx()] = `${this.format_currency(this.accumulators.category)}`
          this.set_accumulators_to_zero('category')
          break;
        case "month":
          row.push(`${this.current_month} SubTTL`, '', '', this.format_currency(this.accumulators.month))
          this.month_subtotals.push(`${this.format_currency(this.accumulators.month)}`)
          this.set_accumulators_to_zero('month')
          break;
        case "total":
          row.push('Total', '', '', this.format_currency(this.accumulators.total))
          break;
      }
      this.csv.push(row)
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

    get_month_idx() {
      const d = new Date(`${this.current_month}-1-2025`);
      return d.getMonth();
    }

    category_by_month(){
      return {
        'Eating Out': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Utilities': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Medical': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Groceries': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Insect Habitat': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Books Music DVDs': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Pets': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Household': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Home Maintenance': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Auto': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Gifts': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Haircuts': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Entertainment': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Home Furnishings': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Misc': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Credit Card Interest': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Mortgage': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Home Equity Loan': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Tax Prep': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Apps': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Streaming Services': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Subscriptions Membership': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Cell Phones': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Clothing': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Health and Exercise': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Education': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Bank Charges': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Electronics': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Investment Expenses': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Travel': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Computer Services': [0,0,0,0,0,0,0,0,0,0,0,0],
        'Donations': [0,0,0,0,0,0,0,0,0,0,0,0]
      }
  }

  categories() {
    return [
      'Eating Out',
      'Utilities',
      'Medical',
      'Groceries',
      'Insect Habitat',
      'Books Music DVDs',
      'Pets',
      'Household',
      'Home Maintenance',
      'Auto',
      'Gifts',
      'Haircuts',
      'Entertainment',
      'Home Furnishings',
      'Misc',
      'Credit Card Interest',
      'Mortgage',
      'Home Equity Loan',
      'Tax Prep',
      'Apps',
      'Streaming Services',
      'Subscriptions Membership',
      'Cell Phones',
      'Clothing',
      'Health and Exercise',
      'Education',
      'Bank Charges',
      'Electronics',
      'Investment Expenses',
      'Travel',
      'Computer Services',
      'Donations'
    ]
  }

  create_totals_csv() {
    const categories = this.categories()
    for (let idx = 0; idx < categories.length; idx++) {
      let row = []
      row.push(categories[idx])
      // Logger.log(`categories[idx] is ${categories[idx]}`)
      // Logger.log(`this.month_cat_subtotals[categories[idx]] is ${this.month_cat_subtotals[categories[idx]]}`)
      // Logger.log(`total ${categories[idx]} row: ${row}`)
      row = row.concat( this.month_cat_subtotals[categories[idx]] );
      // Logger.log(`totals row before pushing == ${row}`)
      // Logger.log(`totals row length == ${row.length}`)
      this.totals_csv.push(row)
    }
    let new_row = ['']
    new_row = new_row.concat(this.month_subtotals)
    while(new_row.length < 13) {
      new_row.push(0)
    }
    // Logger.log(`month subtotal row length == ${new_row.length}`)
    // Logger.log(`month subtotals row: ${new_row}`)
    this.totals_csv.push(new_row)
  }
}
