#include <iostream>
#include <map>
#include <string>
#include <chrono>
#include <thread>
class ComplexLogicSwitch;

class State {
protected:
    ComplexLogicSwitch *statemachine;

public:
    virtual ~State() {}

    void set_context(ComplexLogicSwitch *statemachine) {
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

class ComplexLogicSwitch {
private:
    State* state = nullptr;
public:
    int count = 0;
    bool isOn = false;
    bool isActive = true;
    ComplexLogicSwitch(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~ComplexLogicSwitch() {
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
        if (true) {
            statemachine->isOn = true;
            statemachine->count = (statemachine->count + 1);
            statemachine->isActive = (statemachine->isOn && ((statemachine->count > 0)));
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
            statemachine->isActive = (statemachine->isOn || ((statemachine->count < 5)));
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
    

typedef void (ComplexLogicSwitch::*Event)();

int main() {
    ComplexLogicSwitch *statemachine = new ComplexLogicSwitch(new Off);

    static std::map<std::string, Event> event_by_name;
    event_by_name["toggle"] = &ComplexLogicSwitch::toggle;
    event_by_name["reset"] = &ComplexLogicSwitch::reset;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the ComplexLogicSwitch statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
