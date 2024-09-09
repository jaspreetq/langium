#include <iostream>
#include <map>
#include <string>
#include <chrono>
#include <thread>
class HomeSecurity;

class State {
protected:
    HomeSecurity *statemachine;

public:
    virtual ~State() {}

    void set_context(HomeSecurity *statemachine) {
        this->statemachine = statemachine;
    }

    virtual std::string get_name() {
        return "Unknown";
    }

    virtual void resetSystem() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void disarmSystem() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void triggerAlarm() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class HomeSecurity {
private:
    State* state = nullptr;
public:
    bool systemArmed = false;
    int attempts = 0;
    int maxAttempts = 3;
    HomeSecurity(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~HomeSecurity() {
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
    void resetSystem() {
        state->resetSystem();
    }
    void disarmSystem() {
        state->disarmSystem();
    }
    void triggerAlarm() {
        state->triggerAlarm();
    }
};

class Disarmed : public State {
public:
    std::string get_name() override { return "Disarmed"; }
    void triggerAlarm() override;
};
class AlarmTriggered : public State {
public:
    std::string get_name() override { return "AlarmTriggered"; }
    void resetSystem() override;
    void disarmSystem() override;
};
class Locked : public State {
public:
    std::string get_name() override { return "Locked"; }
    void disarmSystem() override;
};
    // Disarmed

    void Disarmed::triggerAlarm() {
        if (true) {
            statemachine->systemArmed = true;
            statemachine->attempts = 0;
            std::cout << "Alarm triggered! System armed." << std::endl;
            statemachine->transition_to(new AlarmTriggered);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // AlarmTriggered

    void AlarmTriggered::resetSystem() {
        if (((statemachine->attempts < statemachine->maxAttempts))) {
            statemachine->attempts = (statemachine->attempts + 1);
            std::cout << "Reset attempt: " << statemachine->attempts << std::endl;
            statemachine->transition_to(new AlarmTriggered);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void AlarmTriggered::disarmSystem() {
        if (true) {
            statemachine->systemArmed = false;
            std::cout << "System disarmed." << std::endl;
            statemachine->transition_to(new Disarmed);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // Locked

    void Locked::disarmSystem() {
        if (true) {
            statemachine->systemArmed = false;
            std::cout << "System disarmed from locked state." << std::endl;
            statemachine->transition_to(new Disarmed);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

typedef void (HomeSecurity::*Event)();

int main() {
    HomeSecurity *statemachine = new HomeSecurity(new Disarmed);

    static std::map<std::string, Event> event_by_name;
    event_by_name["resetSystem"] = &HomeSecurity::resetSystem;
    event_by_name["disarmSystem"] = &HomeSecurity::disarmSystem;
    event_by_name["triggerAlarm"] = &HomeSecurity::triggerAlarm;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the HomeSecurity statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
