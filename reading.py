import os
import classes.Event as Event

def readEvent(date:str, update:bool=False) -> Event:
    for path, subs, files in os.walk("Data/Events"):
        if not date in subs:
            raise KeyError("Event from " + date + " not in Data/Events")
        
    #otherwise, make a new Event with Event.date=date input

    #Find Matches.txt
        #For each player who appears in the matches.txt, make sure they have a [NAME].txt for their decklist.
        #Figure out everyone's record, then populate the event's record dictionary
    
    #Read decks.txts
        #For each player, go actually read their decklist, put all the cards into a deck, add that deck to the record
            #If update=True, will also go find and update the card's winrate.

