import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';

// Card representation and deck handling
const SUITS = ['h', 'd', 'c', 's'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// Create a deck of cards
const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push(value + suit);
    }
  }
  return deck;
};

// Shuffle the deck using Fisher-Yates algorithm
const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const PokerGame = () => {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [computerHand, setComputerHand] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [gameStage, setGameStage] = useState('initial');
  const [pot, setPot] = useState(0);
  const [playerChips, setPlayerChips] = useState(1000);
  const [computerChips, setComputerChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [message, setMessage] = useState('Welcome to Poker! Click Deal to start.');

  // Initialize or reset the game
  const initializeGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setPlayerHand([]);
    setComputerHand([]);
    setCommunityCards([]);
    setGameStage('initial');
    setPot(0);
    setCurrentBet(0);
    setMessage('Welcome to Poker! Click Deal to start.');
  };

  // Deal initial hands
  const dealHands = () => {
    const newDeck = [...deck];
    const playerCards = [newDeck.pop(), newDeck.pop()];
    const computerCards = [newDeck.pop(), newDeck.pop()];
    
    setPlayerHand(playerCards);
    setComputerHand(computerCards);
    setDeck(newDeck);
    setGameStage('preflop');
    
    // Initial blinds
    const smallBlind = 10;
    const bigBlind = 20;
    
    setPlayerChips(prev => prev - bigBlind);
    setComputerChips(prev => prev - smallBlind);
    setPot(smallBlind + bigBlind);
    setCurrentBet(bigBlind);
    setMessage('Preflop round - Your turn to act');
  };

  // Deal community cards based on the game stage
  const dealCommunityCards = () => {
    const newDeck = [...deck];
    let newCommunityCards = [...communityCards];
    
    if (gameStage === 'preflop') {
      // Deal flop
      newCommunityCards = [newDeck.pop(), newDeck.pop(), newDeck.pop()];
      setGameStage('flop');
      setMessage('Flop round - Your turn to act');
    } else if (gameStage === 'flop') {
      // Deal turn
      newCommunityCards.push(newDeck.pop());
      setGameStage('turn');
      setMessage('Turn round - Your turn to act');
    } else if (gameStage === 'turn') {
      // Deal river
      newCommunityCards.push(newDeck.pop());
      setGameStage('river');
      setMessage('River round - Your turn to act');
    }
    
    setCommunityCards(newCommunityCards);
    setDeck(newDeck);
    setCurrentBet(0);
  };

  // Handle player actions
  const handlePlayerAction = (action) => {
    switch (action) {
      case 'check':
        if (currentBet === 0) {
          handleComputerAction();
        }
        break;
      case 'call':
        const callAmount = currentBet;
        setPlayerChips(prev => prev - callAmount);
        setPot(prev => prev + callAmount);
        handleComputerAction();
        break;
      case 'raise':
        const raiseAmount = currentBet + 20;
        setPlayerChips(prev => prev - raiseAmount);
        setPot(prev => prev + raiseAmount);
        setCurrentBet(raiseAmount);
        handleComputerAction();
        break;
      case 'fold':
        setComputerChips(prev => prev + pot);
        initializeGame();
        break;
    }
  };

  // Simple computer AI
  const handleComputerAction = () => {
    const random = Math.random();
    
    if (random < 0.1) {
      // Fold
      setPlayerChips(prev => prev + pot);
      initializeGame();
    } else if (random < 0.6) {
      // Call
      const callAmount = currentBet;
      setComputerChips(prev => prev - callAmount);
      setPot(prev => prev + callAmount);
      advanceGameStage();
    } else {
      // Raise
      const raiseAmount = currentBet + 20;
      setComputerChips(prev => prev - raiseAmount);
      setPot(prev => prev + raiseAmount);
      setCurrentBet(raiseAmount);
      setMessage('Computer raised. Your turn.');
    }
  };

  // Advance the game stage
  const advanceGameStage = () => {
    if (gameStage === 'river') {
      determineWinner();
    } else {
      dealCommunityCards();
    }
  };

  // Determine the winner
  const determineWinner = () => {
    const random = Math.random();
    
    if (random < 0.5) {
      setPlayerChips(prev => prev + pot);
      setMessage('You win! ' + pot + ' chips');
    } else {
      setComputerChips(prev => prev + pot);
      setMessage('Computer wins! ' + pot + ' chips');
    }
    
    setTimeout(initializeGame, 2000);
  };

  // Render a card
  const renderCard = (card) => {
    if (!card) return null;
    
    const value = card[0];
    const suit = card[1];
    
    const suitSymbol = {
      'h': '♥',
      'd': '♦',
      'c': '♣',
      's': '♠'
    }[suit];
    
    const isRed = suit === 'h' || suit === 'd';
    
    return (
      <div className={`inline-block mx-1 p-2 bg-white border rounded ${isRed ? 'text-red-600' : 'text-black'}`}>
        {value}{suitSymbol}
      </div>
    );
  };

  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader className="text-center">Computer Chips: {computerChips}</CardHeader>
        <CardContent className="text-center">
          {gameStage !== 'initial' && computerHand.map((card, i) => (
            <div key={i} className="inline-block mx-1 p-2 bg-gray-200 border rounded">
              ?
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="text-center">Community Cards</CardHeader>
        <CardContent className="text-center">
          {communityCards.map((card, i) => renderCard(card))}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="text-center">
          Pot: {pot} | Current Bet: {currentBet}
        </CardHeader>
        <CardContent className="text-center">{message}</CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="text-center">Your Hand</CardHeader>
        <CardContent className="text-center">
          {playerHand.map((card, i) => renderCard(card))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="text-center p-4">
          <div className="mb-4">Your Chips: {playerChips}</div>
          {gameStage === 'initial' ? (
            <Button onClick={dealHands} className="mx-2">Deal</Button>
          ) : (
            <div>
              <Button onClick={() => handlePlayerAction('fold')} className="mx-2">Fold</Button>
              {currentBet === 0 && <Button onClick={() => handlePlayerAction('check')} className="mx-2">Check</Button>}
              {currentBet > 0 && <Button onClick={() => handlePlayerAction('call')} className="mx-2">Call {currentBet}</Button>}
              <Button onClick={() => handlePlayerAction('raise')} className="mx-2">Raise</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PokerGame;