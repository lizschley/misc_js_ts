class YTD_ExpenseReport {
    constructor(data) {
      this.data = data;
      this.csv = [['Month', 'Category', 'Subcat', 'Amount']]
      this.year = 'year from name'
      this.current_title = 'from month keys'
      this.current_month = 'month'
      this.accumulators = {
        total: 0.00,
        month: 0.00,
        category: 0.00,
        subcat: 0.00
      };
      this.save_category = '';
      this.save_subcat = '';
    }

    run() {
      this.order_keys_and_process_data();
    }
  
    order_keys_and_process_data() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      for (let idx = 0; idx < months.length; idx++) {
        var key = this.check_for_month_in_data_key(months[idx])
        if (!key) continue;
      }
    }
  
    check_for_month_in_data_key(month) {
      for (let process_idx = 0; process_idx < this.data.length; process_idx++) {
        if (!this.data[process_idx]) return null
        let current_data_with_key = this.data[process_idx]
        let key = Object.keys(current_data_with_key).toString()
        if (key.includes(month)) {
          this.retrieve_data_using_key(current_data_with_key, key)
        }
      }
      this.add_totals_row('total')
    }
  
    retrieve_data_using_key(current_data_with_key, key){
      let curr_data = current_data_with_key[key]
      console.log(key)
      // console.log(curr_data)
      this.current_title = key;
      var temp_array = this.current_title.split('_')
      this.year = temp_array[0]
      this.current_month = temp_array[1]
      console.log(`temp array == ${JSON.stringify(temp_array)}; this.year ${this.year}; this.current_month ${this.current_month}`) 
      this.month_data(curr_data)
    }
  
    month_data(current_data){
      this.reset_totals('month')
      console.log(`current_data length == ${current_data.length}`)
      this.process_rows(current_data)
    }
    
    process_rows(current_data) {
      for (let row_idx = 0; row_idx < current_data.length; row_idx++) {
        let row = []
        row.push(this.current_month)
  
        let category = current_data[row_idx][0]
        if (category != this.save_category || (row_idx == 0)) this.reset_totals('category')
        this.save_category = category
        row.push(category)
  
        let subcat = current_data[row_idx][1]
        if (subcat != this.save_subcat || (row_idx == 0)) this.reset_totals('subcat')
        this.save_subcat = subcat
        row.push(subcat)
  
        let amount = this.format_currency(current_data[row_idx][3])
        row.push(amount)
        
        console.log(`amount == ${amount}`)
        this.add_row_to_accumulators(current_data[row_idx][3])
        console.log(this.accumulators)
        console.log(row)
        this.csv.push(row)
      }
      console.log(this.csv)
    }

    reset_totals(level) {
        if (this.save_subcat.length > 1) this.add_totals_row('subcat')
        this.accumulators.subcat = 0.00;
        if (level == 'subcat') return;
        if (this.save_category.length > 1) this.add_totals_row('category')
        this.accumulators.category = 0.00;
        if (level == 'category') return;
        if (this.save_category.length > 1) this.add_totals_row('month')
        this.accumulators.month = 0.00;
        // console.log(`this.accumulators == ${JSON.stringify(this.accumulators)}`)
        return  
    }

    add_totals_row(level){
        let row = []
        row.push(this.current_month, this.save_subcat, `${this.save_subcat} SubTTL`, this.accumulators.subcat)
        if (level == 'subcat') return;
        row.push(this.current_month, `${this.save_category} SubTTL`, '', this.accumulators.category)
        if (level == 'category') return;
        row.push(`${this.current_month} SubTTL`, '', '', this.accumulators.month)
        if (level == 'month') return;
        row.push('Total', '', '', '', this.accumulators.total)
        this.csv.push(row)
    }
  
    add_row_to_accumulators(amount) {
      this.accumulators.subcat = this.accumulators.subcat + amount;
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
  