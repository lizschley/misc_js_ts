// keep example search argument: 'after:12/31/2011 before:07/01/2012 in:inbox'
// this is the first half of 2012... working backwards from 2011 (beginning of lizschley gmail acct)
const SEARCH_ARG = 'after:12/31/2011 before:07/01/2012 in:inbox'
const LABEL_STRING = 'history/2012'
const LABEL = GmailApp.getUserLabelByName(LABEL_STRING)
const UPDATE = false
const DELETE = false
const SUBJECTS_TO_DELETE = []

function label_email_by_date_search() {
  const threads = GmailApp.search(SEARCH_ARG)
  let temp_array = []
  Logger.log(`thread count by search arg ${threads.length} threads`)
  for (let idx=0; idx < threads.length; idx++) {
    Logger.log(`num msg in thread: ${threads[idx].getMessageCount()}`)
    Logger.log(`first subject: ${threads[idx].getFirstMessageSubject()}`)
    label_and_archive_email(threads[idx])
    // let messages = threads[idx].getMessages()
    // view_email(messages[0])
    // delete_or_update(threads[idx])
    temp_array.push(`"${threads[idx].getFirstMessageSubject()}"`)
  }
  Logger.log(temp_array)
  // Manual process for SUBJECTS_TO_DELETE
  // 1. Copy the temp_array to a file (one row, minus the square brackets)
  // 2. Upload to google sheets
  // 3. Make list using this formula in the row below the data, for ex: // manual process for SUBJECTS_TO_DELETE
  // 4. Copy the entire list (A2:end of list, is what I did)
  // 5. With A2 higlighted, use menu to  paste special/values only
  // 6. Decide what to delete the subjects you want to keep (can use the program output & gmail, if necessary, if in doubt keep), removing them from the list of values
  // 7. After deleting the keepers, delete the values in the first row and then transpose the list to the first row
  // 8. Export as CSV
  // 9. Cut and paste values to the SUBJECTS_TO_DELETE array
}

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
      }
    }
  }
}

function label_and_archive_email(thread) {
  if (!UPDATE) { return }
  addLabel(label)
  thread.moveToArchive()
}

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
        }
      }
    }
}

function label_and_archive_email(thread) {
  if (!UPDATE) { return }
  addLabel(label)
  thread.moveToArchive()
}

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
      Logger.log(`${msg_idx+1}. ${type} subject: ${threads[idx].getFirstMessageSubject()}`)
      view_email(messages[msg_idx])
    }
  }
}

// testing - help in understanding discrepencies
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

function view_email(message) {
    Logger.log(`date: ${message.getDate()}; Id: ${message.getId()}`);
    Logger.log(`from ${message.getFrom()}; to: ${message.getTo()}}`);
    // Logger.log(`subject ${message.getSubject()}`);
    // Logger.log(`to: ${message.getTo()}`);
    // Logger.log(message.getPlainBody());
    Logger.log('--------------------------');
}
