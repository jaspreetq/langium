#include <iostream>
#include <map>
#include <string>
#include <chrono>
#include <thread>
class VendingMachine;

class State {
protected:
    VendingMachine *statemachine;

public:
    virtual ~State() {}

    void set_context(VendingMachine *statemachine) {
        this->statemachine = statemachine;
    }

    virtual std::string get_name() {
        return "Unknown";
    }

    virtual void insertCoin() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void selectItem() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void dispenseItem() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void cancel() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class VendingMachine {
private:
    State* state = nullptr;
public:
    int balance = 0;
    bool itemSelected = (false || (balance < 0));
    int itemPrice = 50;
    int stock = 10;
    VendingMachine(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~VendingMachine() {
        if (state != nullptr) {
            delete state;
        }
    }

    void transition_to(State *new_state) {
        std::cout << state->get_name() << " ===> " << new_state->get_name() << std::endl;
        if (state != nullptr) {
            delete state;
        }
        new_state->set_context(this);
        state = new_state;
    }
    void insertCoin() {
        state->insertCoin();
    }
    void selectItem() {
        state->selectItem();
    }
    void dispenseItem() {
        state->dispenseItem();
    }
    void cancel() {
        state->cancel();
    }
};

class Idle : public State {
public:
    std::string get_name() override { return "Idle"; }
    void insertCoin() override;
};
class AwaitingSelection : public State {
public:
    std::string get_name() override { return "AwaitingSelection"; }
    void insertCoin() override;
    void selectItem() override;
    void cancel() override;
};
class ProcessingSelection : public State {
public:
    std::string get_name() override { return "ProcessingSelection"; }
    void dispenseItem() override;
    void cancel() override;
};
class Dispensing : public State {
public:
    std::string get_name() override { return "Dispensing"; }
    void insertCoin() override;
    void dispenseItem() override;
};
    // Idle

    void Idle::insertCoin() {
        if (true) {
            std::cout << "Please insert a coin" << std::endl;
            statemachine->transition_to(new AwaitingSelection);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // AwaitingSelection

    void AwaitingSelection::insertCoin() {
        if (((statemachine->balance < statemachine->itemPrice))) {
            statemachine->balance = (statemachine->balance + 10);
            std::cout << "Balance updated: " << statemachine->balance << std::endl;

            std::cout << "Delaying transition for 1000 milliseconds..." << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(1000));
        
            std::cout << "Run Command: notifyUser()" << std::endl;
            statemachine->transition_to(new AwaitingSelection);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void AwaitingSelection::selectItem() {
        if (((statemachine->balance >= statemachine->itemPrice))) {
            statemachine->itemSelected = true;
            std::cout << "Item selected." << std::endl;
            statemachine->transition_to(new ProcessingSelection);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void AwaitingSelection::cancel() {
        if (true) {
            std::cout << "Transaction cancelled." << std::endl;
            statemachine->balance = 0;
            statemachine->itemSelected = false;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // ProcessingSelection

    void ProcessingSelection::dispenseItem() {
        if (((statemachine->itemSelected && (statemachine->stock > 0)))) {
            std::cout << "Dispensing item..." << std::endl;

            std::cout << "Delaying transition for 2000 milliseconds..." << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));
        
            statemachine->transition_to(new Dispensing);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void ProcessingSelection::cancel() {
        if (true) {
            std::cout << "Transaction cancelled." << std::endl;
            statemachine->balance = 0;
            statemachine->itemSelected = false;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // Dispensing

    void Dispensing::insertCoin() {
        if (true) {
            statemachine->balance = (statemachine->balance - statemachine->itemPrice);
            std::cout << "Item dispensed. Balance: " << statemachine->balance << std::endl;
            statemachine->stock = (statemachine->stock - 1);
            std::cout << "Run Command: playSound()" << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Dispensing::dispenseItem() {
        if (true) {
            std::cout << "Insufficient stock." << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

typedef void (VendingMachine::*Event)();

int main() {
    VendingMachine *statemachine = new VendingMachine(new Idle);

    static std::map<std::string, Event> event_by_name;
    event_by_name["insertCoin"] = &VendingMachine::insertCoin;
    event_by_name["selectItem"] = &VendingMachine::selectItem;
    event_by_name["dispenseItem"] = &VendingMachine::dispenseItem;
    event_by_name["cancel"] = &VendingMachine::cancel;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the VendingMachine statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
