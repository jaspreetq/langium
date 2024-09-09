#include <iostream>
#include <map>
#include <string>
#include <chrono>
#include <thread>
class TrafficLight;

class State {
protected:
    TrafficLight *statemachine;

public:
    virtual ~State() {}

    void set_context(TrafficLight *statemachine) {
        this->statemachine = statemachine;
    }

    virtual std::string get_name() {
        return "Unknown";
    }

    virtual void next() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void switchMode() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class TrafficLight {
private:
    State* state = nullptr;
public:
    int timeElapsedInSec = 0;
    bool isNightMode = false;
    TrafficLight(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~TrafficLight() {
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
    void next() {
        state->next();
    }
    void switchMode() {
        state->switchMode();
    }
};

class RedLight : public State {
public:
    std::string get_name() override { return "RedLight"; }
    void switchMode() override;
    void next() override;
};
class GreenLight : public State {
public:
    std::string get_name() override { return "GreenLight"; }
    void next() override;
    void switchMode() override;
};
class YellowLight : public State {
public:
    std::string get_name() override { return "YellowLight"; }
    void next() override;
    void switchMode() override;
};
class NightMode : public State {
public:
    std::string get_name() override { return "NightMode"; }
    void next() override;
};
    // RedLight

    void RedLight::switchMode() {
        if (true) {
            statemachine->isNightMode = true;
            std::cout << "Switching to night mode." << std::endl;
            statemachine->transition_to(new NightMode);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void RedLight::next() {
        if (true) {

            std::cout << "Delaying transition for 6000 milliseconds..." << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(6000));
        
            statemachine->timeElapsedInSec = 6;
            std::cout << "Switching to Yellow Light after " << statemachine->timeElapsedInSec << " seconds of Red Light." << std::endl;
            statemachine->transition_to(new YellowLight);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // GreenLight

    void GreenLight::next() {
        if ((((statemachine->timeElapsedInSec >= 5) || statemachine->isNightMode))) {

            std::cout << "Delaying transition for 6000 milliseconds..." << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(6000));
        
            statemachine->timeElapsedInSec = 6;
            std::cout << "Switching to Red Light after " << statemachine->timeElapsedInSec << " seconds of Green Light." << std::endl;
            statemachine->transition_to(new RedLight);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void GreenLight::switchMode() {
        if (true) {
            statemachine->isNightMode = true;
            std::cout << "Switching to night mode." << std::endl;
            statemachine->transition_to(new NightMode);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // YellowLight

    void YellowLight::next() {
        if (true) {

            std::cout << "Delaying transition for 3000 milliseconds..." << std::endl;
            std::this_thread::sleep_for(std::chrono::milliseconds(3000));
        
            statemachine->timeElapsedInSec = (statemachine->timeElapsedInSec + 3);
            std::cout << "Switching to Green Light after 3 seconds of Yellow Light." << std::endl;
            statemachine->transition_to(new GreenLight);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void YellowLight::switchMode() {
        if (true) {
            statemachine->isNightMode = true;
            std::cout << "Switching to night mode." << std::endl;
            statemachine->transition_to(new NightMode);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // NightMode

    void NightMode::next() {
        if (true) {
            statemachine->timeElapsedInSec = 0;
            statemachine->isNightMode = false;
            std::cout << "Exiting night mode. Switching to Red Light." << std::endl;
            statemachine->transition_to(new RedLight);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

typedef void (TrafficLight::*Event)();

int main() {
    TrafficLight *statemachine = new TrafficLight(new RedLight);

    static std::map<std::string, Event> event_by_name;
    event_by_name["next"] = &TrafficLight::next;
    event_by_name["switchMode"] = &TrafficLight::switchMode;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the TrafficLight statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
