import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActivityIndicatorIOS,
  AsyncStorage,
} from 'react-native';

const STORAGE_KEY = '@BitminterNative:key';

const REQUEST_URL = 'https://bitminter.com/api/users';

class BitminterNative extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      api_key: null,
      input_value: null,
    };
  }

  componentDidMount() {
    this.loadFromStorage()
      .then(() => {
        if (this.state.api_key) {
          this.fetchData();
        }})
        .done();
  }

  async loadFromStorage() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value !== null) {
        console.log('Found key:', value);
        this.setState({
          api_key: value
        });
      } else {
        console.log('No key');
      }
    } catch (error) {
      console.log(`AsyncStorage error: ${error.mesage}`);
    }
  }

  async writeToStorage() {
    this.setState({
      api_key: this.state.input_value
    });
    this.fetchData();
    try {
      await AsyncStorage.setItem(STORAGE_KEY, this.state.input_value);
    } catch (error) {
      console.log(`AsyncStorage error: ${error.message}`);
    }
  }

  async removeFromStorage() {
    try {
      await AsyncStorage.remoteItem(STORAGE_KEY);
    } catch (error) {
      console.log(`AsyncStorage error: ${error.message}`);
    }
  }

  getDataOptions = () => {
    return {
      headers: {
        'User-Agent': 'app',
        'Authorization': `key=${this.state.api_key}`,
      },
      timeout: 5000
    };
  }

  fetchData = () => {
    this.setState({
      user: null
    });

    fetch(REQUEST_URL, this.getDataOptions())
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          user: responseData
        })
      })
      .catch((error) => {
        console.log("Error in fetch");
      })
      .done();
  }

  renderKeyInput() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder='Bitminter API Key'
          placeholderTextColor='#93a1a1'
          color='#073642'
          selectionColor='#268bd2'
          autoCorrect={false}
          autoCapitalize='none'
          onChangeText={(input_value) => this.setState({input_value})}
        />
        <TouchableHighlight onPress={this.writeToStorage.bind(this)}>
          <Text style={styles.button}>
            Submit
          </Text>
        </TouchableHighlight>
      </View>
    );
  }

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <ActivityIndicatorIOS
          animating={true}
          color='#eee8d5'
          size='large'
        />
      </View>
    );
  }

  formatHashRate(hash_rate) {
    return String(hash_rate).slice(0,3)
  }

  render() {

    if (!this.state.api_key) {
      return this.renderKeyInput();
    }

    if (!this.state.user) {
      return this.renderLoadingView();
    }

    const user = this.state.user;
    return (
      <TouchableWithoutFeedback style={styles.container} onPress={this.fetchData}>
        <View style={styles.container}>
          <Text style={styles.coin}>
            {user.balances.BTC}
            <Text style={styles.label}>BTC</Text>
          </Text>
          <Text style={styles.hashes}>
            {this.formatHashRate(user.hash_rate)} ghps
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#002b36',
  },
  coin: {
    fontSize: 45,
    textAlign: 'center',
    margin: 10,
    color: '#468847',
  },
  label: {
    fontSize: 10,
  },
  hashes: {
    textAlign: 'center',
    color: '#eee8d5',
    marginBottom: 5,
    fontSize: 20,
  },
  change: {
    color: '#dc322f',
    fontSize: 10,
    marginTop: 100,
  },
  input: {
    height: 40,
    margin: 10,
    padding: 10,
    backgroundColor: '#eee8d5',
  },
  button: {
    color: '#468847',
    fontSize: 20,
    margin: 10,
  },
});

AppRegistry.registerComponent('BitminterNative', () => BitminterNative);
