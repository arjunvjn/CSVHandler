import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';

const FileUploadPage = () => {

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [filesList, setFilesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileListUpdated, setFileListUpdated] = useState(false);

  useEffect(()=>{
    const apiUrl = process.env.REACT_APP_API_URL;
    axios.get(`${apiUrl}file/list`).
    then((response)=>{
        console.log(response)
        if(response.data.status === "Success") 
            setFilesList(response.data.data)
    }).catch((error)=>console.log(error))
  },[fileListUpdated])

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileDelete = async (id) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
        await axios.delete(`${apiUrl}file/delete/${id}`).
        then((response)=>{
            console.log(response)
            setFileListUpdated(!fileListUpdated)
        }).catch((error)=>console.log(error))
    }
    catch (error) {
        console.log(error)
    }
  }

  const handleFileUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((response)=>{
        console.log(response)
        if(response.data.status === "Success") {
            setFilesList([...filesList, response.data.data])
            setMessage("File uploaded successfully!");
        }
        else {
            setMessage("Error uploading file");
        }
      }).catch((err)=>{
        console.log(err)
        setMessage("Error uploading file");
      })
    } catch (error) {
      setMessage("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ marginBottom: '10px' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Upload File"}
      </Button>
      {message && <p>{message}</p>}

      <h3>Uploaded Files</h3>
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filesList.map((file, index) => (
              <TableRow key={index}>
                <TableCell>{file.file_name}</TableCell>
                <TableCell>
                  <Link to={`/file/${file.id}`} style={{ textDecoration: 'none' }}>
                    View Details
                  </Link>
                </TableCell>
                <TableCell>
                  <Button variant="outlined" color="error" onClick={()=>handleFileDelete(file.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default FileUploadPage;
