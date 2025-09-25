import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const CHATS_COLLECTION = 'chats';

// Save a chat to Firestore
export const saveChat = async (userId, chatData) => {
  try {
    const chatsRef = collection(db, CHATS_COLLECTION);
    const docRef = await addDoc(chatsRef, {
      ...chatData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
};

// Get all chats for a user
export const getUserChats = async (userId) => {
  try {
    const chatsRef = collection(db, CHATS_COLLECTION);
    const q = query(
      chatsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const chats = [];

    querySnapshot.forEach((doc) => {
      chats.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Update a chat
export const updateChat = async (chatId, chatData) => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      ...chatData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    throw error;
  }
};

// Delete a chat
export const deleteChat = async (chatId) => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await deleteDoc(chatRef);
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};