'use client';
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import {
  Box,
  Typography,
  Modal,
  Button,
  TextField,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { collection, getDocs, setDoc, deleteDoc, doc, getDoc, query } from 'firebase/firestore';

const theme = createTheme({
  typography: {
    fontFamily: 'serif',
  },
});

const boxModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 600,
  bgcolor: '#F1F8E8',
  border: '3 solid black',
  boxShadow: 24,
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  transform: 'translate(-50%, -50%)',
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemQuantity, setItemQuantity] = useState(0);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredPantry, setFilteredPantry] = useState([]);
  const [hasAddedItem, setHasAddedItem] = useState(false);
  const [lowQuantityItems, setLowQuantityItems] = useState([]);
  const [showMessage, setShowMessage] = useState(false);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const documents = await getDocs(snapshot);
    const pantryList = [];
    const lowQuantityList = [];
    documents.forEach((doc) => {
      const data = {
        nameOfItem: doc.id,
        ...doc.data(),
      };
      pantryList.push(data);
      if (data.quantity === 1) {
        lowQuantityList.push(data);
      }
    });
    setPantry(pantryList);
    setFilteredPantry(pantryList);
    setLowQuantityItems(lowQuantityList);
  };

  const addItem = async (item, quantity, category) => {
    const normalizedItem = item.trim().toLowerCase();
    const normalizedCategory = category.trim().toLowerCase();
    const actualDoc = doc(collection(firestore, 'inventory'), normalizedItem);
    const docSnapshot = await getDoc(actualDoc);
    if (docSnapshot.exists()) {
      const { quantity: existingQuantity } = docSnapshot.data();
      await setDoc(
        actualDoc,
        {
          quantity: Number(existingQuantity) + Number(quantity),
          category: normalizedCategory,
        },
        { merge: true }
      );
    } else {
      await setDoc(actualDoc, { category: normalizedCategory, quantity });
    }
    await updatePantry();
    setHasAddedItem(true);
  };

  const removeItem = async (item) => {
    const normalizedItem = item.trim().toLowerCase();
    const actualDoc = doc(collection(firestore, 'inventory'), normalizedItem);
    const docSnapshot = await getDoc(actualDoc);
    if (docSnapshot.exists()) {
      const { quantity, category } = docSnapshot.data();
      if (quantity <= 1) {
        await deleteDoc(actualDoc);
      } else {
        await setDoc(
          actualDoc,
          { quantity: quantity - 1, category: category },
          { merge: true }
        );
      }
    }
    await updatePantry();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAddItem = () => {
    addItem(itemName, itemQuantity, itemCategory);
    setItemName('');
    setItemQuantity(0);
    setItemCategory('');
    handleClose();
  };
  const handleSearchClick = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setFilteredPantry(pantry);
    }
  };
  const handleMessageClick = () => {
    setShowMessage(!showMessage);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredPantry(
        pantry.filter(
          (item) =>
            item.nameOfItem.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase().trim())
        )
      );
    } else {
      setFilteredPantry(pantry);
    }
  }, [searchTerm, pantry]);

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex" width="100vw" height="100vh" sx={{ backgroundColor: '#F1F8E8' }}>
        {hasAddedItem && (
          <Drawer
            variant="permanent"
            anchor="left"
            sx={{
              width: 200,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 200,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F1F8E8',
              },
            }}
          >
            <List>
              <ListItem button onClick={handleOpen}>
                <ListItemText primary="Add" />
              </ListItem>
              <ListItem button onClick={handleSearchClick}>
                <ListItemText primary="Search" />
              </ListItem>
              <ListItem button onClick={handleMessageClick}>
                <ListItemText primary="Reminder" />
              </ListItem>
              {showMessage && lowQuantityItems.length > 0 && (
                <ListItem>
                  <ListItemText
                    primary={`You need to buy: ${lowQuantityItems.map((item) => item.nameOfItem).join(', ')}`}
                  />
                </ListItem>
              )}
            </List>
          </Drawer>
        )}
        <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={5} p={3}>
          {hasAddedItem && isSearching && (
            <TextField
              label="Search"
              variant="outlined"
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          <Modal open={open} onClose={handleClose}>
            <Box sx={boxModalStyle}>
              <Typography variant="h5">Add Item</Typography>
              <form noValidate autoComplete="off">
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  required
                  margin="normal"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value.trim().toLowerCase())}
                />
                <TextField
                  label="Category"
                  variant="outlined"
                  fullWidth
                  required
                  margin="normal"
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value.trim().toLowerCase())}
                />
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  required
                  margin="normal"
                  type="number"
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
                <Button variant="contained" onClick={handleAddItem} sx={{ backgroundColor: '#55AD9B', color: '#0c0c0c' }}>
                  Add to Pantry
                </Button>
              </form>
            </Box>
          </Modal>
          {!hasAddedItem && (
            <Stack>
              <Typography variant="h2">Welcome to PantryPeek</Typography>
              <Button
                variant="contained"
                style={{ backgroundColor: '#55AD9B', color: '#0c0c0c', fontSize: '20px' }}
                onClick={handleOpen}
              >
                Ready to Track Items
              </Button>
            </Stack>
          )}
          {hasAddedItem && (
            <Box border="2px solid #000">
              <Box width="800px" height="100px" bgcolor="#95D2B3" display="flex" alignItems="center" justifyContent="center">
                <Typography variant="h2" color="#0c0c0c">
                  Your PantryPeek
                </Typography>
              </Box>
              <Box
                width="800px"
                height="50px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#55AD9B"
                padding={3}
              >
                <Typography variant="h6">Item</Typography>
                <Typography variant="h6">Category</Typography>
                <Typography variant="h6">Quantity</Typography>
                <Typography variant="h6">Delete</Typography>
              </Box>
              <Stack width="800px" height="500px" spacing={2} overflow="auto">
                {filteredPantry.map(({ nameOfItem, category, quantity }) => (
                  <Box
                    key={nameOfItem}
                    width="100%"
                    minHeight="120px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bgcolor="#D8EFD3"
                    padding={3}
                  >
                    <Typography variant="h6">{nameOfItem}</Typography>
                    <Typography variant="h6">{category}</Typography>
                    <Typography variant="h6">{quantity}</Typography>
                    <Button onClick={() => removeItem(nameOfItem)}>Delete</Button>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}