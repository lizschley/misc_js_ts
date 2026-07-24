function delete_threads_older_than_14_days() {

  const label_name = "add_label_here";
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const cut_off = formatted_date(14)

  // working example
  // label:activism before:2026/07/01
  const query = `label:${label_name} before:${cut_off}`;
  console.log(`query == ${query}`)
  const threads = GmailApp.search(query);

  let trashed = 0;

  for (const thread of threads) {
    const messages = thread.getMessages();
    let repliedByMe = false;

    for (const message of messages) {
      const from = message.getFrom().toLowerCase();
      if (from.includes(email)) {
        repliedByMe = true;
        break;
      }
    }

    if (!repliedByMe) {
      thread.moveToTrash();
      trashed++;
    }
  }

  console.log(`Moved ${trashed} unanswered thread(s) to trash.`);
}

function formatted_date(days_ago) {
  const d = new Date(Date.now() - days_ago * 24 * 60 * 60 * 1000);
  const formatted =
  `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  console.log(`number of days ago: ${days_ago}`)
  console.log(`Formatted date == ${formatted}`);
  return formatted
}
