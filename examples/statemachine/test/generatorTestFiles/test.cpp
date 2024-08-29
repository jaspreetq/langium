#include <iostream>
#include <map>
#include <string>

class HomeAutomation;

class State {
protected:
    HomeAutomation *statemachine;

public:
    virtual ~State() {}

    void set_context(HomeAutomation *statemachine) {
        this->statemachine = statemachine;
    }

    virtual std::string get_name() {
        return "Unknown";
    }

    virtual void motionDetected() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void noMotion() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void lightOn() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void lightOff() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void temperatureRise() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void temperatureDrop() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class HomeAutomation {
private:
    State* state = nullptr;
public:
    bool isMotionDetected = false;
    bool isLightOn = false;
    int currentTemperature = 22;
    int targetTemperature = 24;
    HomeAutomation(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~HomeAutomation() {
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
    void motionDetected() {
        state->motionDetected();
    }
    void noMotion() {
        state->noMotion();
    }
    void lightOn() {
        state->lightOn();
    }
    void lightOff() {
        state->lightOff();
    }
    void temperatureRise() {
        state->temperatureRise();
    }
    void temperatureDrop() {
        state->temperatureDrop();
    }
};

class Idle : public State {
public:
    std::string get_name() override { return "Idle"; }
    void motionDetected() override;
    void noMotion() override;
    void temperatureRise() override;
    void temperatureDrop() override;
};
class MotionDetected : public State {
public:
    std::string get_name() override { return "MotionDetected"; }
    void motionDetected() override;
    void lightOn() override;
    void lightOff() override;
    void temperatureRise() override;
    void temperatureDrop() override;
};
class LightOn : public State {
public:
    std::string get_name() override { return "LightOn"; }
    void noMotion() override;
    void lightOff() override;
    void temperatureRise() override;
    void temperatureDrop() override;
};
class Heating : public State {
public:
    std::string get_name() override { return "Heating"; }
    void temperatureDrop() override;
    void temperatureRise() override;
    void lightOn() override;
    void lightOff() override;
};
    // Idle

    void Idle::motionDetected() {
        if (true) {

            statemachine->transition_to(new MotionDetected);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Idle::noMotion() {
        if (true) {

            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Idle::temperatureRise() {
        if (true) {

            statemachine->transition_to(new Heating);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Idle::temperatureDrop() {
        if (true) {
            std::cout << "System is Idle, Motion: " << statemachine->isMotionDetected << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // MotionDetected

    void MotionDetected::motionDetected() {
        if (statemachine->isMotionDetected) {

            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void MotionDetected::lightOn() {
        if (true) {

            statemachine->transition_to(new LightOn);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void MotionDetected::lightOff() {
        if (true) {

            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void MotionDetected::temperatureRise() {
        if (true) {

            statemachine->transition_to(new Heating);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void MotionDetected::temperatureDrop() {
        if (true) {
            std::cout << "Motion Detected, turning on lights" << std::endl;
            std::cout << "Run Command: turnOnLights()" << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // LightOn

    void LightOn::noMotion() {
        if (true) {

            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void LightOn::lightOff() {
        if (true) {

            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void LightOn::temperatureRise() {
        if (true) {

            statemachine->transition_to(new Heating);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void LightOn::temperatureDrop() {
        if (true) {
            std::cout << "Lights are ON, Motion: " << statemachine->isMotionDetected << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // Heating

    void Heating::temperatureDrop() {
        if ((statemachine->currentTemperature < statemachine->targetTemperature)) {

            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Heating::temperatureRise() {
        if (true) {

            statemachine->transition_to(new Heating);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Heating::lightOn() {
        if (true) {

            statemachine->transition_to(new LightOn);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Heating::lightOff() {
        if (true) {
            std::cout << "Heating the home, Current Temperature: " << statemachine->currentTemperature << std::endl;
            std::cout << "Run Command: startHeating()" << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

typedef void (HomeAutomation::*Event)();

int main() {
    HomeAutomation *statemachine = new HomeAutomation(new Idle);

    static std::map<std::string, Event> event_by_name;
    event_by_name["motionDetected"] = &HomeAutomation::motionDetected;
    event_by_name["noMotion"] = &HomeAutomation::noMotion;
    event_by_name["lightOn"] = &HomeAutomation::lightOn;
    event_by_name["lightOff"] = &HomeAutomation::lightOff;
    event_by_name["temperatureRise"] = &HomeAutomation::temperatureRise;
    event_by_name["temperatureDrop"] = &HomeAutomation::temperatureDrop;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the HomeAutomation statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
