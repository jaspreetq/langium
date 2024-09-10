#include <iostream>
#include <map>
#include <string>
#include <chrono>
#include <thread>
class SmartThermostat;

class State {
protected:
    SmartThermostat *statemachine;

public:
    virtual ~State() {}

    void set_context(SmartThermostat *statemachine) {
        this->statemachine = statemachine;
    }

    virtual std::string get_name() {
        return "Unknown";
    }

    virtual void increaseTemperature() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void decreaseTemperature() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void setMode() {
        std::cout << "Impossible event for the current state." << std::endl;
    }

    virtual void reset() {
        std::cout << "Impossible event for the current state." << std::endl;
    }
};

class SmartThermostat {
private:
    State* state = nullptr;
public:
    int currentTemperature = 22;
    int targetTemperature = 24;
    bool heatingEnabled = false;
    bool coolingEnabled = false;
    int safetyThreshold = 30;
    bool energySavingMode = false;
    SmartThermostat(State* initial_state) {
        initial_state->set_context(this);
        state = initial_state;
        std::cout << "[" << state->get_name() <<  "]" << std::endl;
    }

    ~SmartThermostat() {
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
    void increaseTemperature() {
        state->increaseTemperature();
    }
    void decreaseTemperature() {
        state->decreaseTemperature();
    }
    void setMode() {
        state->setMode();
    }
    void reset() {
        state->reset();
    }
};

class Idle : public State {
public:
    std::string get_name() override { return "Idle"; }
    void increaseTemperature() override;
    void decreaseTemperature() override;
    void setMode() override;
};
class AdjustingTemperature : public State {
public:
    std::string get_name() override { return "AdjustingTemperature"; }
    void reset() override;
    void increaseTemperature() override;
    void decreaseTemperature() override;
    void setMode() override;
};
class SafetyLock : public State {
public:
    std::string get_name() override { return "SafetyLock"; }
    void reset() override;
};
class EnergySavingMode : public State {
public:
    std::string get_name() override { return "EnergySavingMode"; }
    void reset() override;
    void increaseTemperature() override;
    void decreaseTemperature() override;
};
    // Idle

    void Idle::increaseTemperature() {
        if (true) {
            statemachine->targetTemperature = (statemachine->targetTemperature + 2);
            std::cout << "Increasing target temperature to " << statemachine->targetTemperature << std::endl;
            statemachine->transition_to(new AdjustingTemperature);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Idle::decreaseTemperature() {
        if (true) {
            statemachine->targetTemperature = (statemachine->targetTemperature - 2);
            std::cout << "Decreasing target temperature to " << statemachine->targetTemperature << std::endl;
            statemachine->transition_to(new AdjustingTemperature);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void Idle::setMode() {
        if (((statemachine->targetTemperature <= statemachine->safetyThreshold))) {
            statemachine->heatingEnabled = ((statemachine->currentTemperature < statemachine->targetTemperature));
            statemachine->coolingEnabled = ((statemachine->currentTemperature > statemachine->targetTemperature));
            statemachine->energySavingMode = false;
            std::cout << "Adjusting system mode. Heating: " << statemachine->heatingEnabled << ", Cooling: " << statemachine->coolingEnabled << std::endl;
            statemachine->transition_to(new AdjustingTemperature);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // AdjustingTemperature

    void AdjustingTemperature::reset() {
        if (true) {
            statemachine->heatingEnabled = false;
            statemachine->coolingEnabled = false;
            std::cout << "Resetting to idle mode." << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void AdjustingTemperature::increaseTemperature() {
        if (true) {
            statemachine->targetTemperature = (statemachine->targetTemperature + 1);
            statemachine->heatingEnabled = ((statemachine->currentTemperature < statemachine->targetTemperature));
            statemachine->coolingEnabled = ((statemachine->currentTemperature > statemachine->targetTemperature));
            std::cout << "Target temperature increased to " << statemachine->targetTemperature << ". Heating: " << statemachine->heatingEnabled << ", Cooling: " << statemachine->coolingEnabled << std::endl;
            statemachine->transition_to(new AdjustingTemperature);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void AdjustingTemperature::decreaseTemperature() {
        if (true) {
            statemachine->targetTemperature = (statemachine->targetTemperature - 1);
            statemachine->heatingEnabled = ((statemachine->currentTemperature < statemachine->targetTemperature));
            statemachine->coolingEnabled = ((statemachine->currentTemperature > statemachine->targetTemperature));
            std::cout << "Target temperature decreased to " << statemachine->targetTemperature << ". Heating: " << statemachine->heatingEnabled << ", Cooling: " << statemachine->coolingEnabled << std::endl;
            statemachine->transition_to(new AdjustingTemperature);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void AdjustingTemperature::setMode() {
        if ((statemachine->energySavingMode)) {
            std::cout << "Switching to energy-saving mode." << std::endl;
            statemachine->transition_to(new EnergySavingMode);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // SafetyLock

    void SafetyLock::reset() {
        if (true) {
            statemachine->heatingEnabled = false;
            statemachine->coolingEnabled = false;
            std::cout << "Safety lock reset. Returning to idle mode." << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    
    // EnergySavingMode

    void EnergySavingMode::reset() {
        if (true) {
            statemachine->energySavingMode = false;
            std::cout << "Energy-saving mode disabled. Returning to idle mode." << std::endl;
            statemachine->transition_to(new Idle);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void EnergySavingMode::increaseTemperature() {
        if (true) {
            statemachine->targetTemperature = (statemachine->targetTemperature + 1);
            std::cout << "Increased temperature in energy-saving mode to " << statemachine->targetTemperature << std::endl;
            statemachine->transition_to(new EnergySavingMode);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

    void EnergySavingMode::decreaseTemperature() {
        if (true) {
            statemachine->targetTemperature = (statemachine->targetTemperature - 1);
            std::cout << "Decreased temperature in energy-saving mode to " << statemachine->targetTemperature << std::endl;
            statemachine->transition_to(new EnergySavingMode);
        } else {
            std::cout << "Transition not allowed." << std::endl;
        }
    }
    

typedef void (SmartThermostat::*Event)();

int main() {
    SmartThermostat *statemachine = new SmartThermostat(new Idle);

    static std::map<std::string, Event> event_by_name;
    event_by_name["increaseTemperature"] = &SmartThermostat::increaseTemperature;
    event_by_name["decreaseTemperature"] = &SmartThermostat::decreaseTemperature;
    event_by_name["setMode"] = &SmartThermostat::setMode;
    event_by_name["reset"] = &SmartThermostat::reset;
    for (std::string input; std::getline(std::cin, input);) {
        std::map<std::string, Event>::const_iterator event_by_name_it = event_by_name.find(input);
        if (event_by_name_it == event_by_name.end()) {
            std::cout << "There is no event <" << input << "> in the SmartThermostat statemachine." << std::endl;
            continue;
        }
        Event event_invoker = event_by_name_it->second;
        (statemachine->*event_invoker)();
    }

    delete statemachine;
    return 0;
}
