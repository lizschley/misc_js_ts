function search_and_replace_filenames_within_folder() {
    let folder_id = 'This works for filenames within a given folder id' // Replace with your folder ID
    let folder = DriveApp.getFolderById(folder_id);
    let files = folder.getFiles();
    // replace following three variables if needed
    let mime_type = 'image/heif' // Taken with an iPhone
    let old_part = 'Ironical'
    let new_part = 'Zhang'
    while (files.hasNext()) {
      var file = files.next();
      if( file.getMimeType() != mime_type) {
          console.log(`wrong mimetype == ${file.getMimeType()}`)
          continue
      }
      var current_name = file.getName();
      // Check if the file name contains the old part
      if (current_name.includes(old_part)) {
        // Replace the old part with the new part
        var new_name = current_name.replace(old_part, new_part);
        // Rename the file
        file.setName(new_name);
        console.log("Renamed file: " + current_name + " to " + new_name);
      }
    }
  }
