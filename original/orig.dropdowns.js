/*
@OnlyCurrentDoc
*/

function dropdown(e){
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('expenses');
    const range = e.range;
    const col = range.getColumn();
    const picked_row = range.getRow();
    const val = range.getValue();
    const source = e.source.getActiveSheet();
    /* 
    Logger.log('cat col == ' + col)
    Logger.log('picked_row == ' + picked_row)
    Logger.log('cat val == ' + val)
    Logger.log('sheet name (source) == ' + source.getName())
    */
    
    if (source.getName() == 'expenses' && val != '' && col == 1){
      let dropdown_sheet = ss.getSheetByName('dropdowns');
      let titles = dropdown_sheet.getRange(1,2,1,dropdown_sheet.getLastColumn()-1).getValues().flat();
      let index = titles.indexOf(val);
      let subcat_col = index + 2;
      /*
      Logger.log('titles (category headers for subcategories) == ' + titles)
      Logger.log('index for picked category title == ' + index)
      Logger.log('subcat_col = index + 2' + subcat_col)
      */
      let prelim_subcat = dropdown_sheet.getRange(2,subcat_col,dropdown_sheet.getLastRow()-1,1).getValues().flat()
      let last_subcat = prelim_subcat.indexOf('')
      // Logger.log('last_subcat == ' + last_subcat)
      sheet.getRange(picked_row,col+1).clearDataValidations()
      if (last_subcat <1) {
        return;
      }
      subcat_range = dropdown_sheet.getRange(2,subcat_col,last_subcat,1)
      let rule = SpreadsheetApp.newDataValidation().requireValueInRange(subcat_range).setAllowInvalid(false).build();
      sheet.getRange(picked_row,col+1).setDataValidation(rule);
    }
  }
  
  