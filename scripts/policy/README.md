Policy Data Processing Scripts
------------------------------

These scripts are responsible from taking the raw Policy data in `.xls` format, cleaning them, and inserting them into a PostgreSQL database.  

#### Google Drive API

We host the raw data in our Google Drive, which the Python scripts access to get the raw data.  Details on getting the necessary credentials can be found [here](https://googledrive.github.io/PyDrive/docs/build/html/quickstart.html#authentication), but the gist is:

1. Go to APIs Console and make your own project.
2. Search for ‘Google Drive API’, select the entry, and click ‘Enable’.
3. Select ‘Credentials’ from the left menu, click ‘Create Credentials’, select ‘OAuth client ID’.
Now, the product name and consent screen need to be set -> click ‘Configure consent screen’ and follow the instructions. Once finished:
  1. Select ‘Application type’ to be Web application.
  2. Enter an appropriate name.
  3. Input http://localhost:8080 for ‘Authorized JavaScript origins’.
  4. Input http://localhost:8080/ for ‘Authorized redirect URIs’.
  5. Click ‘Create’.
4. Click ‘Download JSON’ on the right side of Client ID to download client_secret_<really long ID>.json.

The downloaded file has all authentication information of your application. Rename the file to “client_secrets.json” and place it in your working directory.

#### Usage

Assuming the necessary Google Drive API credentials are in place (see above):

- `./xls_to_pg.py`: will download the `.xls` files and do the following
  - Generate a `script.txt` that can be used to copy the data into a PostgreSQL database
  - Generate a `PolicyFields.jsx` file that is to be included in the React application

To copy the data to Postgres, do the following:

`
cat script.txt | psql <db_url>
`







