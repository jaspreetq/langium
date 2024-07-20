#include <iostream>
#include <map>
#include <string>

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

    virtual void switchCapacity() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void next() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class TrafficLight {
private:
    State* state = nullptr;
public:
    int cnt = (((13 - 4) + ((2 * 3))) + (5 / 4));
    bool isEmpty = ((cnt > 10) && (cnt < 20));
    bool checkDefault = false;
    TrafficLight(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[op" << state->get_name() <<  "]" << std::endl;
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
void switchCapacity() {
    state->switchCapacity();
}
void next() {
    state->next();
}

};

class PowerOff : public State {
public:
    std::string get_name() override { return "PowerOff"; }
    void switchCapacity() override;
};
class RedLight : public State {
public:
    std::string get_name() override { return "RedLight"; }
    void switchCapacity() override;
    void next() override;
};
class YellowLight : public State {
public:
    std::string get_name() override { return "YellowLight"; }
    void switchCapacity() override;
    void next() override;
};
class GreenLight : public State {
public:
    std::string get_name() override { return "GreenLight"; }
    void switchCapacity() override;
    void next() override;
};
// PowerOff

        void PowerOff::switchCapacity() {
            if(true) {
                std::cout << (statemachine->cnt > 10) << std::endl;
statemachine->cnt = ((statemachine->cnt + 1) + (20 * ((statemachine->cnt + 1))));
std::cout << statemachine->cnt << std::endl;
std::cout << (statemachine->isEmpty && statemachine->checkDefault) << std::endl;
                statemachine->transition_to(new RedLight);
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        
// RedLight

        void RedLight::switchCapacity() {
            if(((12 - (32 * 30)) > statemachine->cnt)) {
                
                statemachine->transition_to(new PowerOff);
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        

        void RedLight::next() {
            if(true) {
                
                statemachine->transition_to(new GreenLight);
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        
// YellowLight

        void YellowLight::switchCapacity() {
            if(true) {
                
                statemachine->transition_to(new PowerOff);
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        

        void YellowLight::next() {
            if(true) {
                
                statemachine->transition_to(new RedLight);
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        
// GreenLight

        void GreenLight::switchCapacity() {
            if(true) {
                
                statemachine->transition_to(new PowerOff);
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        

        void GreenLight::next() {
            if(true) {
                
                statemachine->transition_to(new YellowLight);
            } else {
                std::cout << "Transition not allowed." << std::endl;
            }
        }
        

typedef void (TrafficLight::*Event)();

int main() {
    TrafficLight *statemachine = new TrafficLight(new PowerOff);

    static std::map<std::string, Event> event_by_name;
    event_by_name["switchCapacity"] = &TrafficLight::switchCapacity;
    event_by_name["next"] = &TrafficLight::next;
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
