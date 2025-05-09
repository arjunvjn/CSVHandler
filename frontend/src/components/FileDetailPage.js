import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    TextField,
    Modal,
    Box,
    Typography
} from '@mui/material';
import { useParams } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TablePagination from '@mui/material/TablePagination';

const FileDetailPage = () => {

    const { id } = useParams();

    const [tableHeaders, setTableHeaders] = useState([]);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    


    const [loading, setLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);
    const [fromEmail, setFromEmail] = useState('');
    const [toEmail, setToEmail] = useState('');

    const [dateFilter, setDateFilter] = useState('');
    const [restaurantNameFilter, setRestaurantNameFilter] = useState('');

    const [filteredData, setFilteredData] = useState([]);

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };

    useEffect(() => {
        console.log(id)
        if (id) {
            setLoading(true);
            const apiUrl = process.env.REACT_APP_API_URL;
            axios.get(`${apiUrl}file/${id}`)
                .then((response) => {
                    console.log(response.data);
                    setTableHeaders(response.data.column_names);
                    setData(response.data.data);
                    setLoading(false);
                    setFilteredData(response.data.data);
                })
                .catch((error) => {
                    console.log(error);
                    setLoading(false);
                });
        }
    }, [id]);

    const handleChangePage = (event, newPage) => {
        console.log(newPage)
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedData = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, page, rowsPerPage]);

    const handleSearch = () => {
        let filtered = data;
        console.log(restaurantNameFilter, dateFilter)
        if (restaurantNameFilter) {
            filtered = filtered.filter(row => row[2].toLowerCase().includes(restaurantNameFilter.toLowerCase()));
        }
        if (dateFilter) {
            filtered = filtered.filter(row => row[0].includes(dateFilter));
        }
        console.log(filtered)
        setFilteredData(filtered);
    }

    const handleDelete = async (record) => {
        console.log(record)
        const apiUrl = process.env.REACT_APP_API_URL;
        await axios.put(`${apiUrl}file/delete_row/${id}`, { data: record })
            .then((response) => {
                console.log(response)
                if (response.data.status === 'Success')
                    window.location.reload()
            }).catch((error) => console.log(error))
    }

    const handleDownload = async (record) => {
        console.log(record)

        const res = {};
        tableHeaders.forEach((key, index) => {
            res[key] = record[index];
        });
        console.log(res)

        const formattedData = Object.entries(res)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");

        const blob = new Blob([formattedData], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = res['ONDC Order ID'] + '.txt';
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const handleSend = async () => {
        const apiUrl = process.env.REACT_APP_API_URL;
        await axios.post(`${apiUrl}file/send_email/${id}`, {
            fromEmail: fromEmail,
            toEmail: toEmail
        })
            .then((response) => {
                console.log(response)
                if (response.data.status === 'Success')
                    setOpenModal(false)
            }).catch((error) => console.log(error))
    }


    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            <h2>File Data</h2>

            <div style={{ marginBottom: '20px' }}>
                <TextField
                    label="Search by Date"
                    variant="outlined"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <TextField
                    label="Search by Restaurant Name"
                    variant="outlined"
                    value={restaurantNameFilter}
                    onChange={(e) => setRestaurantNameFilter(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={loading}
                    style={{ marginRight: '30px' }}
                >Search
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenModal(true)}
                    disabled={loading}
                >Send Email
                </Button>
            </div>

            <TableContainer
                component={Paper}
                style={{ marginTop: '20px', maxHeight: '400px', overflow: 'auto' }}
            >
                <Table stickyHeader aria-label="file data table">
                    <TableHead>
                        <TableRow>
                            {tableHeaders && tableHeaders.map((header, index) => (
                                <TableCell key={index}>{header}</TableCell>
                            ))}
                            <TableCell>Actions</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((record, index) => (
                            <TableRow key={index}>
                                {record.map((val, idx) => (
                                    <TableCell key={idx}>{val}</TableCell>
                                ))}
                                <TableCell>
                                    <Button variant="outlined" color="error" onClick={() => handleDelete(record)}>
                                        Delete
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outlined" color="primary" onClick={() => handleDownload(record)}>
                                        Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="email-modal-title"
            >
                <Box sx={modalStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography id="email-modal-title" variant="h6" component="h2">
                            Send Email
                        </Typography>
                        <IconButton onClick={() => setOpenModal(false)}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <TextField
                        fullWidth
                        label="From Email Address"
                        variant="outlined"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        style={{ marginBottom: '16px' }}
                    />
                    <TextField
                        fullWidth
                        label="To Email Address"
                        variant="outlined"
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        style={{ marginBottom: '24px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSend}
                    >
                        Send
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

export default FileDetailPage;
