class YTD_ExpenseReport {
    constructor(data) {
      this.data = data;
      this.csv = [['Month', 'Category', 'Subcat', 'Amount']]
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

    run() {
      this.order_keys_and_process_data();
      this.add_totals_row('total')
    }
  
    order_keys_and_process_data() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      for (let idx = 0; idx < months.length; idx++) {
        var key = this.check_for_month_in_data_key(months[idx])
        if (key)
          this.done.push(key)
        else { continue;}
      }
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
      this.month_data(curr_data)
    }
  
    month_data(current_data){
      this.reset_totals('month')
      this.process_rows(current_data)
    }
    
    process_rows(current_data) {
      for (let row_idx = 0; row_idx < current_data.length; row_idx++) {
        let row = []
        row.push(this.current_month)
  
        let category = current_data[row_idx][0]
        if (category != this.save_category) this.reset_totals('category')
        this.save_category = category
        row.push(category)

        let subcat = current_data[row_idx][1]
        row.push(subcat)
  
        let amount = this.format_currency(current_data[row_idx][3])
        row.push(amount)
        this.add_row_to_accumulators(current_data[row_idx][3])
        this.csv.push(row)
      }
    }

    reset_totals(level) {
        if (this.save_category.length > 2) this.add_totals_row('category')
        if (level == 'category') return;
        if (this.save_category.length > 2) this.add_totals_row('month')
        if (level == 'month') return;
        this.add_totals_row('total')
        return  
    }

    add_totals_row(level){
        let row = []
        row.push(this.current_month, `${this.save_category} SubTTL`, '', this.accumulators.category)
        this.set_accumulators_to_zero('category')
        this.csv.push(row)
        if (level == 'category') return;
        row = []
        row.push(`${this.current_month} SubTTL`, '', '', this.accumulators.month)
        this.csv.push(row)
        this.set_accumulators_to_zero('month')
        if (level == 'month') return;
        row = []
        row.push('Total', '', '', '', this.accumulators.total)
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
  }
