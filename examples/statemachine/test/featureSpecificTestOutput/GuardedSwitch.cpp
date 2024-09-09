#include <iostream>
#include <map>
#include <string>
#include <chrono>
#include <thread>
class GuardedSwitch;

class State {
protected:
    GuardedSwitch *statemachine;

public:
    virtual ~State() {}

    void set_context(GuardedSwitch *statemachine) {
        this->statemachine = statemachine;
    }

    virtual std::string get_name() {
        return "Unknown";
    }

    virtual void toggle() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void reset() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class GuardedSwitch {
private:
    State* state = nullptr;
public:
    int count = 0;
    bool isOn = false;
    bool isActive = true;
    GuardedSwitch(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~GuardedSwitch() {
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
    void toggle() {
        state->toggle();
    }
    void reset() {
        state->reset();
    }
};

class Off : public State {
public:
    std::string get_name() override { return "Off"; }
    void toggle() override;
};
class On : public State {
public:
    std::string get_name() override { return "On"; }
    void toggle() override;
    void reset() override;
};
    // Off

    void Off::toggle() {
        if (((statemachine->count < 3))) {
            statemachine->isOn = true;
            statemachine->count = (statemachine->count + 1);
            statemachine->transition_to(new On);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // On

    void On::toggle() {
        if (true) {
            statemachine->isOn = false;
            statemachine->count = (statemachine->count * 2);
            statemachine->transition_to(new Off);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void On::reset() {
        if (true) {
            statemachine->isOn = false;
            statemachine->count = 0;
            statemachine->isActive = false;
            statemachine->transition_to(new Off);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

typedef void (GuardedSwitch::*Event)();

int main() {
    GuardedSwitch *statemachine = new GuardedSwitch(new Off);

    static std::map<std::string, Event> event_by_name;
    event_by_name["toggle"] = &GuardedSwitch::toggle;
    event_by_name["reset"] = &GuardedSwitch::reset;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the GuardedSwitch statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
