import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent'
//when null setting in type , need union type like IActivity:null
//how to conenct in the other file use useContext 
//HOC every child is chined by observer (HOC) and use actions in other file in HOC by useContext
//Observable map()

configure({ enforceActions: 'always' });
// loading action inside await realistically better to wrap in runInAction 
//only async wait after wait runInAction(()=>{})
class ActivityStore {
  @observable activityRegistry = new Map();//map function replate push,find so on in the array
  @observable activities: IActivity[] = [];
  @observable loadingInitial = false;
  @observable selectedActivity: IActivity | undefined;//selectedAcitivity was undefined so type also chnges to undefin from null
  @observable editMode = false;
  @observable submitting = false;
  @observable target = '';
  //computed all have data in side store , already existing data for sorting

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );
  }//assending date order //date currently string so parse Date to convert date type 
  //convert activityRegistry in to the array, when use values which eill be iterable in the array
  //map(key,value).set()or get() or array.from ...value()


  //asyncroness code// promise error handling//list:Promise<IActivity>
  //then.catch.finally //anything will not executed,untill function list() will be full fill 
  //redactuer from promise chain (then) to async wait chain//const activities = await//used be agent.activities.list()
  //await untill loading list 
  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();//await loading then execute below code
      runInAction('loading activities', () => { //as name loadingactivities
        activities.forEach(activity => {
          //activity:Promise<IActivity[]>
          activity.date = activity.date.split(".")[0];
          this.activityRegistry.set(activity.id, activity);
        })
        //response.data...from backend then convert to string
      });//.set(key,value)//it is used to be activities.push//activityRegistry.set = map function  
      this.loadingInitial = false;

    } catch (error) {
      runInAction('load activities error', () => {// nameing is not mandately 
        this.loadingInitial = false;
        console.log(error);
      })

    }
  };


  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction('createing activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.editMode = false;
        this.submitting = false;
      })
    } catch (error) {
      runInAction('creating activity error', () => {
        this.submitting = false;

      })
      this.submitting = false;
      console.log(error);
    }
  }


  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);
      //set activity
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity)
        this.selectedActivity = activity;
        this.editMode = false;
        this.submitting = false
      })

    } catch (error) {
      runInAction('edditing activity', () => {
        this.submitting = false
      })
    }
  }

  @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);//delete loading and id 
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id);
        this.submitting = false;
        this.target = '';
      })

    } catch (error) {
      runInAction('deleting activity', () => {
        this.submitting = false;
        this.target = '';
      })
      console.log(error)
    }

  }

  @action openCreateForm = () => {
    this.editMode = true;
    this.selectedActivity = undefined;
  }
  @action openEditForm = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id)
    this.editMode = true;
  }
  @action canselSelectedActivity = () => {
    this.selectedActivity = undefined;
    this.editMode = true;
  }

  @action cancelFormOpen = () => {
    this.editMode = false;
  }
  @action selectActivity = (id: string) => {
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode = false;
  };
}
//used to be this.activities.find(a => a.id === id)--get(id)
//everything in the class//instanciation in the createContext()
export default createContext(new ActivityStore())



  // .get<IActivity[]>("http://localhost:5000/api/activities")
  //then(response=>{})
  //for date date is date but string
  //first array split string//push activity in the array //used to be res.data

  //finally mobx 
  //this is class 
  //react context in the store
//syntactical suger ..nothing to change but favorite or not 

// const handleEditActivity = (activity: IActivity) => {
//   setSubmitting(true);
//   agent.Activities.update(activity)
//     .then(() => {
//       setActivities([
//         ...activities.filter(a => a.id !== activity.id),
//         activity
//       ]);
//       setSelectedActivity(activity); //diplay activity on the form
//       setEditMode(false);
//     })
//     .then(() => setSubmitting(false));
// };
//event onclick event Synthetic 

// const handleDeleteActivity = (
//   event: SyntheticEvent<HTMLButtonElement>,
//   id: string
// ) => {
//   setSubmitting(true);
//   setTarget(event.currentTarget.name); //target for deletebutton
//   agent.Activities.delete(id)
//     .then(() => {
//       setActivities([...activities.filter(a => a.id !== id)]);
//     })
//     .then(() => setSubmitting(false));
// };
// const handleCreateActivity = (activity: IActivity) => {
//   setSubmitting(true);
//   agent.Activities.create(activity)
//     .then(() => {
//       setActivities([...activities, activity]);
//       setSelectedActivity(activity); //diplay activity on the view page side bar
//       setEditMode(false);
//     })
//     .then(() => setSubmitting(false));
//   //promise call back
// };
 //CRUD use anonimous call back .then(()=>{....})

  //update filter and find id if not , update
  //CRUD use anonimous call back
  //set activities which dose not match id..except id--> second argument is []
  //exsisting activities.filter(id match), new activity to update
  //[] array
  //id[0] first id a= activities//setSelected use like function
  //useEffect(()=>{
  //componentDidMount().then(res=>setState())
  //})
  //path only array not object as difinition/agent file has all definition of fetching data



//set values //fetch data //fetch//CARS orgin problem
//cross origin resource share headers//axios return <Iactivity[]>
// componentDidMount() {
//   axios
//     .get<IActivity[]>("http://localhost:5000/api/activities")
//     .then(response => {
//       this.setState({
//         activities: response.data
//       });
//     });
// }
//get all activities then type difine so if i path activity.name get error
//interface IActivity has already set what will get