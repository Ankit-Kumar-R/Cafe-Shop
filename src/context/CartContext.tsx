import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext.tsx';

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  subtotal: number;
  discount: number;
  activePromotion: any;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  speechFeedback: string;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ak_cafe_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const { addToast } = useToast();
  const [activePromotion, setActivePromotion] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data.items || []))
      .catch(console.error);

    fetch('/api/promotions')
      .then(res => res.json())
      .then(data => {
        if (data.promotions && data.promotions.length > 0) {
          // Get largest discount
          const bestPromo = data.promotions.reduce((prev: any, current: any) => 
            (prev.discountPercentage > current.discountPercentage) ? prev : current
          );
          setActivePromotion(bestPromo);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('ak_cafe_cart', JSON.stringify(items));
  }, [items]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechFeedback("Listening for 'add [item]'...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice transcript:", transcript);
      
      if (transcript.includes('add')) {
        const match = menuItems.find(item => transcript.includes(item.name.toLowerCase()));
        if (match) {
          addToCart(match);
          setSpeechFeedback(`Added ${match.name} to cart!`);
          setTimeout(() => setSpeechFeedback(''), 3000);
        } else {
          setSpeechFeedback("Could not find that item.");
          setTimeout(() => setSpeechFeedback(''), 3000);
        }
      } else {
        setSpeechFeedback("Say 'add' followed by an item name.");
        setTimeout(() => setSpeechFeedback(''), 3000);
      }
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setSpeechFeedback("Could not hear properly.");
      setTimeout(() => setSpeechFeedback(''), 3000);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setSpeechFeedback('');
    }
  };

  const addToCart = (newItem: CartItem | any) => {
    // Also accept the full menu item from the Menu page
    const itemToAdd = 'menuItemId' in newItem ? newItem : {
      menuItemId: newItem.id,
      name: newItem.name,
      price: parseFloat(newItem.price),
      quantity: 1,
      imageUrl: newItem.imageUrl
    };

    setItems((prev) => {
      const existing = prev.find(i => i.menuItemId === itemToAdd.menuItemId);
      if (existing) {
        return prev.map(i => i.menuItemId === itemToAdd.menuItemId ? { ...i, quantity: i.quantity + itemToAdd.quantity } : i);
      }
      return [...prev, itemToAdd];
    });
    addToast(`Added ${itemToAdd.name} to cart`, 'success');
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const removeFromCart = (menuItemId: number) => {
    setItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setItems(prev => prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = activePromotion ? (subtotal * (activePromotion.discountPercentage / 100)) : 0;
  const total = subtotal - discount;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, subtotal, discount, activePromotion, isListening, startListening, stopListening, speechFeedback } as any}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
