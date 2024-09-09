#include <iostream>
#include <map>
#include <string>
#include <chrono>
#include <thread>
class LightSwitch;

class State {
protected:
    LightSwitch *statemachine;

public:
    virtual ~State() {}

    void set_context(LightSwitch *statemachine) {
        this->statemachine = statemachine;
    }

    virtual std::string get_name() {
        return "Unknown";
    }

    virtual void toggle() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class LightSwitch {
private:
    State* state = nullptr;
public:
    bool isOn = false;
    LightSwitch(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~LightSwitch() {
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
};
    // Off

    void Off::toggle() {
        if (true) {
            statemachine->isOn = true;
            statemachine->transition_to(new On);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // On

    void On::toggle() {
        if (true) {
            statemachine->isOn = false;
            statemachine->transition_to(new Off);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

typedef void (LightSwitch::*Event)();

int main() {
    LightSwitch *statemachine = new LightSwitch(new Off);

    static std::map<std::string, Event> event_by_name;
    event_by_name["toggle"] = &LightSwitch::toggle;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the LightSwitch statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
