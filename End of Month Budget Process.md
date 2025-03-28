End of Month Budget Process

[First Step \- In budget library script](#first-step---in-budget-library-script)

[Second Step \- In new monthly spreadsheet](#second-step---in-new-monthly-spreadsheet)

[Final Step \- In new monthly spreadsheet](#final-step---in-new-monthly-spreadsheet)

#### First Step \- In budget library script {#first-step---in-budget-library-script}

1. folder\_id is id for folder containing current year's expenses  
2. copy\_id is prior month's budget expenses  
3. new\_name is name you want for the new month's budget expenses  
4. Run copy\_monthly\_file

#### Second Step \- In new monthly spreadsheet {#second-step---in-new-monthly-spreadsheet}

1. Change project name  
2. Run budget.clean\_old\_data() \- **need to give permissions**  
   * Clean out rows and data validations (leave headers)  
   * Add category validation (column A)  
   * Add date validation  (column C)  
   * Add date formatting  
   * Add currency formatting (column D)  
   * Add in annual rows  
     * Send in the monthly spreadsheet name  
     * Loop through rows and create a row from annual sheet:   
       * Make sure categories and subcats are valid  
       * Make sure each row is an array of arrays, even if loading one row at a time  
       * Make sure date is a valid date string \- not in annuals, but created programmatically  
       * Divide the annual amount by 12 (annual → monthly)

#### Final Step \- In new monthly spreadsheet  {#final-step---in-new-monthly-spreadsheet}

1. Add new trigger  
2. Make sure dropdowns work  
   