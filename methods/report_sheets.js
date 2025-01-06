
function run_reports() {
    const report_name = create_report_name('_ytd_rpt')
    create_new_tab(report_name)
    const folder_id = readNamedRange('folder_id')
    const report_class = new YTD_ExpenseReport(loop_through_folder(folder_id));  
    report_class.run();
    console.log(report_class.csv)
    createAndPopulateSheet(report_name, report_class.csv)
  }
  
  function createAndPopulateSheet(report_name, report_array) {
    // Get the active spreadsheet
    let ss = SpreadsheetApp.getActiveSpreadsheet();
  
    // Create a new sheet
    let curr_report = ss.insertSheet(report_name);
  
    // Get the dimensions of the array
    //console.log(report_array)
    let rows = report_array.length
    let cols = report_array[0].length;
  
    // Set up the range for data population
    let range = curr_report.getRange(1, 1, rows, cols);
  
    // Populate the sheet with array data
    range.setValues(report_array);
  }
  
  
  function readNamedRange(range_name) {
    var range = SpreadsheetApp.getActive().getRangeByName(range_name);
    var values = range.getValues().flat();
    var folder_id = values.length == 1 ? values[0] : values;
    console.log(JSON.stringify(`folder_id == ${folder_id}`));
    return folder_id
  }
  
  function create_report_name(report_name) {
    const now = new Date (new Date().toLocaleString("en-US", {timeZone: "America/New_York", hour12: true}));
    var date_string = now.getFullYear().toString() + '-';
    date_string = date_string + (now.getMonth() + 1) + '-';
    date_string = date_string + now.getDate() + '-';
    date_string = date_string + now.getHours() + '-';
    date_string = date_string + now.getMinutes();
    return date_string + report_name;
  }
  
  function create_new_tab(report_name) {
    console.log(report_name)
  }
  
  function getData(file_id) {
    let ss = SpreadsheetApp.openById(file_id) // Opens the spreadsheet  
    let name = ss.getName();
    // console.log('name == ' + name)
    let sheet = ss.getSheetByName('test');
    // let month_range = sheet.getRange(['A2:D']);
    let month_range = sheet.getRange(2,1,sheet.getLastRow()-1,4)
    month_range.sort([
      {column: 1, ascending: true},
      {column: 2, ascending: true},
    ]);
    let values = month_range.getValues()
    // console.log(values)
    return { [name]: values }
  }
  
  function loop_through_folder(folder_id) {
    let output = []
    let folder = DriveApp.getFolderById(folder_id); // Replace with your folder ID
    let files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      if (file.getMimeType() === "application/vnd.google-apps.spreadsheet") {
        temp_file_id = file.getId()
        // console.log('temp file id == ' + temp_file_id)
        output.push(getData(temp_file_id))
      }
    }
    return output
  }
  