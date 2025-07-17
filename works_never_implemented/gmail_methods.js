// keep example search argument: 'after:12/31/2011 before:07/01/2012 in:inbox'
// this is the first half of 2012... working backwards from 2011 (beginning of lizschley gmail acct)
const SEARCH_ARG = 'after:12/31/2011 before:07/01/2012 in:inbox'
const LABEL_STRING = 'history/2012'
const LABEL = GmailApp.getUserLabelByName(LABEL_STRING)
const UPDATE = true
const DELETE = true
const SUBJECTS_TO_DELETE = ["[Fwd: hotel]  Sorry--forgot to do this earlier","Looking To Make Money from Your Website? Here's How ...","Domain Sale Extended: Renew Your Domain"," Save Some Money","Linkedin passwords hacked","Noticed your resume - new job open for a PHP Developer - please apply!","Invitation to connect on LinkedIn","IE7 Links","We Know You're Busy -- That's Why Our Survey Is Only 2 Questions","FW: Fixes for IE CSS support","There Has Been Activity On Support Ticket 9565435","Fw: Fwd: Nature Walk at Pine Knot","Protecting Your Website Visitors","Don't Let Others Copy You!","farewell dominoes friends...","Cinco de Mayhem","Kip is going to have surgery on May 7th","Add Favicon video","SHOCKED Cat!!! ns!!","Fairfield Inn & Suites Baltimore Downtown/Inner Harbor Reservation Confirmation #92800523","Create Your Express-Scripts.com Account Today","News from iPage -- Using Weebly To Design Your Website","wedding site","lizschley.net has been renewed","Schwab Retirement Plan Svcs Requested Forms","Dominoes - April 5th","lizschley.net will be auto-renewed","yoga guru","Latest News","The Top 12 Best Cities to Find an IT Job in 2012!","Feliz cumpleaños Rosa","Watch Simon's Cat in 'Shelf Life' on YouTube","Follow -up","Documents for Day 1 at Silverchair - Monday","March 5, 2012","Suggested changes to the Silverchair Coverletter","Your CRN Access","Welcome to LHH Alumni"]

function label_email_by_date_search() {
  const threads = GmailApp.search(SEARCH_ARG)
  let temp_array = []
  Logger.log(`thread count by search arg ${threads.length} threads`)
  for (let idx=0; idx < threads.length; idx++) {
    Logger.log(`num msg in thread: ${threads[idx].getMessageCount()}`)
    Logger.log(`first subject: ${threads[idx].getFirstMessageSubject()}`)
    label_and_archive_email(threads[idx])
    let messages = threads[idx].getMessages()
    view_email(messages[0])
    delete_thread(threads[idx])
    temp_array.push(`"${threads[idx].getFirstMessageSubject()}"`)
  }
  Logger.log(temp_array)
}
// Manual process for SUBJECTS_TO_DELETE
// 1. Copy the temp_array log output to a file (one row, minus the square brackets)
// 2. Upload to google sheets
// 3. Make list using this formula in the row below the data, for ex: // manual process for SUBJECTS_TO_DELETE
// 4. Copy the entire list (A2:end of list, is what I did)
// 5. With A2 higlighted, use menu to  paste special/values only
// 6. Decide what to delete the subjects you want to keep (can use the program output & gmail, if necessary, if in doubt keep), removing them from the list of values
// 7. After deleting the keepers, delete the values in the first row and then transpose the list to the first row
// 8. Export as CSV
// 9. Cut and paste values to the SUBJECTS_TO_DELETE array

function delete_thread(thread, from_inbox=true) {
  for (idx=0; idx<SUBJECTS_TO_DELETE.length; idx++) {
    if (thread.getFirstMessageSubject() == SUBJECTS_TO_DELETE[idx]) {
      Logger.log(`checking thread with subject == ${SUBJECTS_TO_DELETE[idx]}`)
      if (DELETE && thread.isInInbox() && from_inbox) {
        thread.moveToTrash()
        Logger.log(`deleting thread, subj == ${SUBJECTS_TO_DELETE[idx]}`)
        return
      }
      if (DELETE) {
        thread.moveToTrash()
        Logger.log(`deleting thread, subj == ${SUBJECTS_TO_DELETE[idx]}`)
        return
      }
      Logger.log('If DELETE were true, would delete  first subject:')
      Logger.log(SUBJECTS_TO_DELETE[idx])
    }
  }
}

function label_and_archive_email(thread) {
  if (!UPDATE) { return }
  thread.addLabel(LABEL)
  thread.moveToArchive()
}

// Testing function (look for discrepencies)
function label_vs_search() {
  Logger.log(`label == ${LABEL_STRING}`)
  Logger.log(`search == ${SEARCH_ARG}`)
  let label_threads = LABEL.getThreads()
  let search_threads = GmailApp.search(SEARCH_ARG)
  messages_check('label', label_threads)
  messages_check('search', search_threads)
}

function messages_check(type, threads){
  Logger.log(`${type} thread count == ${threads.length} threads`)
  for (let idx=0; idx < threads.length; idx++) {
    Logger.log(`${idx+1}. ${type} subject: ${threads[idx].getFirstMessageSubject()}`)
    Logger.log(`message count in ${type} thread: ${threads[idx].getMessageCount()}`)
    let messages = threads[idx].getMessages()
    for (let msg_idx = 0; msg_idx < messages.length; msg_idx++) {
      view_email(messages[msg_idx])
    }
  }
}

// Use how desire
function view_email(message) {
    Logger.log(`date: ${message.getDate()}; Id: ${message.getId()}`);
    Logger.log(`from ${message.getFrom()}; to: ${message.getTo()}}`);
    // Logger.log(`subject ${message.getSubject()}`);
    // Logger.log(`to: ${message.getTo()}`);
    // Logger.log(message.getPlainBody());
    Logger.log('--------------------------');
}
