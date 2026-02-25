import json
import os
import classes.Event as Event
import scrython

class adv_stats:
    def __init__(self, name:str):
        self.name = name
        self.record = [0,0]
        self.win_rate = 1

        #should be pairs of [date, player]
        self.times_played = []
        self.tags = []
        self.archetypes = []

    def alter_winrate(self, record):
        self.record[0] += record[0]
        self.record[1] += record[1]
        self.win_rate = self.record[0] / (self.record[0] + self.record[1]) 
        
    def add_play(self, date:str, player:str):
        self.times_played.append([date, player])

    def find_favorite(self):
        player_counts = {}
        for date, player in self.times_played:
            if not player in player_counts:
                player_counts[player] = 0
            player_counts[player] += 1
        favorite_player = max(player_counts, key=player_counts.get)
        return favorite_player, player_counts[favorite_player]
    
    def toJSON(self):
        return dict({
            "name": self.name,
            "record": self.record,
            "win_rate": round(self.win_rate, 3),
            "times_played": self.times_played,
            "tags": self.tags,
            "archetypes" : self.archetypes
        })


def convertCubeList(cube_list:str):
    ret_list = {}
    custom_list = []
    with open('Data/custom_cards.json', 'r') as f:
        custom_list = json.load(f)
    with open('Data/CubeVersions/'+cube_list, 'r') as f:
        for line in f.readlines():
            if line.strip() == "":
                continue

            card_name = line.strip()
            #query scryfall api for that card, get the card details

            try:
                card_data = scrython.cards.Named(exact=card_name)

                useful_data = {
                    "name": card_data.name,
                    "mana_cost": card_data.mana_cost,
                    "cmc": card_data.cmc,
                    "colors": card_data.color_identity,
                    "type_line": card_data.type_line,
                    "oracle_text": card_data.oracle_text,
                    "power": card_data.power,
                    "toughness": card_data.toughness,
                    "loyalty": card_data.loyalty,
                    "role_tags":[],
                    "archetype_tags":[]
                }
                
                ret_list[card_name] = useful_data
            
            except:
                print(card_name, " not found, prob custom")
    
    with open('Data/CubeVersions/' + cube_list.replace('.txt', '.json'), 'w') as f:
        json.dump(ret_list, f, indent=4)
            

            
            


def getPlayerWinrates():
    winrecord = {}
    for path, _, files in os.walk("Data/Events"):
        for file in files:
            if file == "Matches.txt":
                date = os.path.basename(path)
                with open(os.path.join(path, file), 'r') as f:
                    for line in f:
                        if line.strip() == "":
                            continue
                        player1, player2 = line.strip().split(' ')
                        if not player1 in winrecord:
                            winrecord[player1] = {"total": [0,0]}
                        if not date in winrecord[player1]:
                            winrecord[player1][date] = [0,0]
                        if not player2 in winrecord:
                            winrecord[player2] = {"total": [0,0]}
                        if not date in winrecord[player2]:
                            winrecord[player2][date] = [0,0]
                        winrecord[player1]["total"][0] += 1
                        winrecord[player2]["total"][1] += 1
                        winrecord[player1][date][0] += 1
                        winrecord[player2][date][1] += 1
    return winrecord

def getCardPlayrates():
    playrecord = {}
    for path, _, files in os.walk("Data/Events"):
        for file in files:
            if file.endswith(".txt") and not file == "Matches.txt":
                date = os.path.basename(path)
                with open(os.path.join(path, file), 'r') as f:
                    for line in f:
                        if line.strip() == "":
                            continue
                        card_name = line.strip()
                        if not card_name in playrecord:
                            playrecord[card_name] = {}
                        if not date in playrecord[card_name]:
                            playrecord[card_name][date] = ""
                        playrecord[card_name][date] = os.path.basename(file)[:-4]
    return playrecord


def updateCardWinrates():
    win_record = getPlayerWinrates()
    play_record = getCardPlayrates()
    card_records = {}
    for card_name, plays in play_record.items():
        for date, player in plays.items():
            #find who played that card in that event, then find their winrate for that event, then add that winrate to the card's winrate, weighted by how many times they played the card
            if not card_name in card_records:
                card_records[card_name] = adv_stats(card_name)
            card_records[card_name].add_play(date, player)
            card_records[card_name].alter_winrate(win_record[player][date])
            
    
    with open("Data/card_stats.json", 'w') as f:
        json.dump({name: card.toJSON() for name, card in card_records.items()}, f, indent=4)
        
        
    #otherwise, make a new Event with Event.date=date input

    #Find Matches.txt
        #For each player who appears in the matches.txt, make sure they have a [NAME].txt for their decklist.
        #Figure out everyone's record, then populate the event's record dictionary
    
    #Read decks.txts
        #For each player, go actually read their decklist, put all the cards into a deck, add that deck to the record
            #If update=True, will also go find and update the card's winrate.


def jsonIfy(date):
    players = {}
    decklists = {}
    for path, _, files in os.walk("Data/Events/"+date):
        for file in files:
            if file == "Matches.txt":
                with open(os.path.join(path, file), 'r') as f:
                    for line in f:
                        if line.strip() == "":
                            continue
                        player1, player2 = line.strip().split(' ')
                        if not player1 in players:
                            players[player1] = {"record": [0,0]}
                        if not player2 in players:
                            players[player2] = {"record": [0,0]}
                        players[player1]["record"][0] += 1
                        players[player2]["record"][1] += 1
            elif file.endswith(".txt"):
                player_name = os.path.basename(file)[:-4]
                with open(os.path.join(path, file), 'r') as f:
                    decklist = [line.strip() for line in f if line.strip() != ""]
                    decklists[player_name] = decklist
    
    with open("Data/Events/"+date+"/event.json", 'w+') as f:
        json.dump({
            "players": players,
            "decklists": decklists
        }, f, indent=4)
            


if __name__ == "__main__":
    convertCubeList("2026_1_17.txt")
    #updateCardWinrates()
    #jsonIfy("2026_1_17")
