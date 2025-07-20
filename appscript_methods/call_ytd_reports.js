const AQUA_HEX = '#7afbff'
const YELLOW_HEX = '#FFFF00'
const EVEN = '#c2ff99'
const ODD = '#fdff99'
const SUBTOTAL = 'SubTTL'
const TOTAL = 'Total'
const EXPECTED_TOTAL_COLUMNS = 13
const EXPECTED_DETAIL_COLUMNS = 4


function run_reports() {
  const report_name = create_report_name('_ytd_rpt')
  const totals_name = create_report_name('_ytd_totals')
  const folder_id = readNamedRange('folder_id')
  const report_class = new YTD_ExpenseReport(loop_through_folder(folder_id));
  report_class.run();
  // console.log(report_class.csv)
  createAndPopulateSheet(report_name, report_class.csv, EXPECTED_DETAIL_COLUMNS)
  // report_class.totals_csv.forEach(test_total_length)
  createAndPopulateSheet(totals_name, report_class.totals_csv, EXPECTED_TOTAL_COLUMNS)
  finishing_touches(report_name)
  finish_totals(totals_name)
  //Logger.log(report_class.month_cat_subtotals)
  //Logger.log(report_class.month_subtotals)
}

function createAndPopulateSheet(report_name, report_array, expected_length) {
  // Get the active spreadsheet
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create a new sheet
  let curr_report = ss.insertSheet(report_name);

  // Get the dimensions of the array
  //console.log(report_array)
  let rows = report_array.length
  console.log(`for ${report_name} rows == ${rows}`)

  let cols = report_array[0].length;
  if (cols != expected_length) {
    throw new Error (`There should be exactly ${expected_length} columns` )
  }

  console.log(`for ${report_name} cols == ${cols}`)

  // Set up the range for data population
  let range = curr_report.getRange(1, 1, rows, cols);
  // console.log(`range.getA1Notation() == ${range.getA1Notation()}`)

  // Populate the sheet with array data
  try {
    range.setValues(report_array);
  } catch(e){
    Logger.log (report_array)
    Logger.log(e)
  }
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

function getData(file_id) {
  let ss = SpreadsheetApp.openById(file_id) // Opens the spreadsheet
  let name = ss.getName();
  console.log('name == ' + name)
  let sheet = ss.getSheetByName('expenses');
  // let month_range = sheet.getRange(['A2:D']);
  let month_range = sheet.getRange(2,1,sheet.getLastRow()-1,EXPECTED_DETAIL_COLUMNS)
  month_range.sort([
    {column: 1, ascending: true},
    {column: 2, ascending: true},
  ]);
  let values = month_range.getValues()
  // throw new Error(values);
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

function finishing_touches(report_name) {
  sheet = SpreadsheetApp.getActive().getSheetByName(report_name)
  basic_finish(sheet)
  sheet.autoResizeColumns(1, EXPECTED_DETAIL_COLUMNS);
  // Logger.log(`before iterate_rows using ${report_name}`)
  iterate_rows(sheet)
}

function finish_totals(totals_name) {
  sheet = SpreadsheetApp.getActive().getSheetByName(totals_name)
  sheet.autoResizeColumns(1, EXPECTED_TOTAL_COLUMNS);
  basic_finish(sheet)
  alternate_row_colors(totals_name)
}

function basic_finish(sheet) {
  // freeze top row
  sheet.setFrozenRows(1);
}

function iterate_rows(sheet) {
  let rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
  for (let idx = 0; idx < rows.length; idx++) {
    // console.log(`idx == ${idx}`)
    // console.log(rows[idx]);
    check_row_and_highlight(sheet, rows[idx], idx)
  }
}

// row	Integer	The starting row index of the range; row indexing starts with 1.
// column	Integer	The starting column index of the range; column indexing starts with 1.
// numRows	Integer	The number of rows to return.
// numColumns	Integer	The number of columns to return.
function check_row_and_highlight(sheet, row, idx) {
  // Logger.log(`in check row & highlight - passed in sheet name: ${sheet.getName()}`)
  highlight_color = check_color(row, idx)
  if (highlight_color == 'white') return
  let range = sheet.getRange(idx+2, 1, 1, sheet.getLastColumn()); // Select row 5, all columns
  range.setBackgroundColor(highlight_color);
}

function check_color(row, idx) {
  if (row[0].includes(SUBTOTAL) || row[0].includes(TOTAL)) return YELLOW_HEX
  if (row[1].includes(SUBTOTAL)) return AQUA_HEX
  return 'white'
}

function alternate_row_colors(totals_name) {
  sheet = SpreadsheetApp.getActive().getSheetByName(totals_name)
  const dataRange = sheet.getDataRange();
  const rows = dataRange.getNumRows();
  const cols = dataRange.getNumColumns();

  for (let i = 0; i < rows; i++) {
    const row = sheet.getRange(i + 1, 1, 1, cols); // Start from row 1
    if (i == 0) continue
    if ((i + 1) % 2 === 1) { // Odd rows
      row.setBackground(ODD);
    } else { // Even rows
      row.setBackground(EVEN);
    }
  }
}
