class YTD_ExpenseReport {
    constructor(data) {
      this.data = data;
      this.csv = [['Month', 'Category', 'Subcat', 'Amount']]
      this.year = 'year from name'
      this.current_title = 'from monthly keys'
      this.current_month = 'month'
      this.accumulators = this.accumulator_start()
      this.data_keys = []
      this.process_data = { save_cat: '',
                            save_sub_cat: '',
                          }
    }
  
    run() {
      this.order_keys_and_process_data();
      /*
      let current_data_with_key = this.data[idx]
      this.month_from_title(current_data_with_key)
      let curr_data_array = current_data_with_key[this.current_title]
      console.log(`len of array ${current_data_with_key[this.current_title].length}`)
      //console.log(`data == ${current_data_with_key}`)
      //console.log(`key == ${this.current_title}`)
      //console.log(`curr_data_array ${curr_data_array}`)
      for (let process_idx = 0; process_idx < curr_data_array.length; process_idx++) {
        //console.log(in process_idx loop)
      }
      */
    }
  
    order_keys_and_process_data() {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      let data_keys = []
      for (let idx = 0; idx < months.length; idx++) {
        var key = this.check_for_month_in_data_key(months[idx])
        if (!key) continue;
        // this.data_keys.push(key);
      }
      //console.log(`data_keys == ${this.data_keys}`)
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
    }
  
    accumulator_start() {
      return {
        level_cleared: '',
        total: 0.00,
        monthly: 0.00,
        category: 0.00,
        subcat: 0.00
      }
    }
  
    set_accumulators_to_zero(level) {
      this.accumulators.subcat = 0.00;
      if (level == 'subcat') return;
      this.accumulators.category = 0.00;
      if (level == 'category') return;
      this.accumulators.monthly = 0.00;
      // console.log(`this.accumulators == ${JSON.stringify(this.accumulators)}`)
      return
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
      this.monthly_data(curr_data)
    }
  
    monthly_data(current_data){
      this.set_accumulators_to_zero('month')
      console.log(`current_data length == ${current_data.length}`)
      console.log('calling process_rows')
      this.process_rows(current_data)
    }
    
    process_rows(current_data) {
      console.log('in process rows');
      console.log(this.accumulators)
      for (let row_idx = 0; row_idx < current_data.length; row_idx++) {
        let row = []
        row.push(this.current_month)
  
        let category = current_data[row_idx][0]
        if (category != this.process_data.save_cat || (row_idx == 0)) this.set_accumulators_to_zero('category')
        this.process_data.save_cat = category
        row.push(category)
  
        let subcat = current_data[row_idx][1]
        if (subcat != this.process_data.save_subcat || (row_idx == 0)) this.set_accumulators_to_zero('subcat')
        this.process_data.save_subcat = subcat
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
      call_fake()
    }
  
    add_row_to_accumulators(amount) {
      this.accumulators.level_cleared = '',
      this.accumulators.subcat = this.accumulators.subcat + amount;
      this.accumulators.category = this.accumulators.category + amount;
      this.accumulators.monthly = this.accumulators.monthly + amount;
      this.accumulators.total = this.accumulators.total + amount;
    }
  
    format_currency(value) {
      return value.toLocaleString('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      });
    }
  }
  