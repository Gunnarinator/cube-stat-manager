
class Event:
    def __init__(self):
        
        #Format: YYYY-MM-DD
        date:str = ""

        #List of str names
        players:list = []

        #Key - Player Name; Value - tuple<int> (wins, losses)
        record:dict = {}

        #Key - Player Name; Value - deck object
        decks:dict = {}

    
    def get_date(self)->str:
        return self.date
    
    def get_record(self, name)->tuple:
        return self.record[name]
    
    def get_deck(self, name):
        return self.decks[name]
    
    def add_record(self, name:str, record:tuple):
        self.record[name] = record

    def add_deck(self, name:str, deck):
        self.decks[name] = deck

    def add_player(self, name:str):
        self.players.append(name)


    def pretty_print(self) -> str:
        retval = ""

        retval += "Cube Draft on " + self.date + "!\n"
        retval += "Featuring: \n"

        for player in self.players:
            retval += player + "(" + self.record[player] + ")\n"

    
    