# End of Month Budget Process

## First Step \- Run Month End Reports

1. Finish entering the complete prior month's expenses
2. YTD Budget report (Reports folder); folder id is for the current year's monthly reports
3. Run the reports (as close as possible to the first day of the new month)
4. Take the time to check for anomolies
5. Move to the budget library for the next step

## Second Step \- Create and Format new monthly expense spreadsheet

1. Open the Budget Library
2. Edit the budget library spreadsheet
* <u>folder\_id</u> is id for folder containing current year's expenses
* <u>copy\_id</u> is prior month's budget expenses
* <u>new\_name</u> is name you want for the new month's budget
3. Open apps script within the library itself
5. Run copy\_monthly\_file

## Third Step \- Prepare the new monthly spreadsheet

1. Change project name
2. Run budget.clean\_old\_data() \- **need to give permissions**

## Final Step \- Add Triggers and test

1. Add two new triggers: onEdit & onOpen
2. Make sure dropdowns work
