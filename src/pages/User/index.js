/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    listRefreshing: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    this.setState({ loading: true });
    const user = navigation.getParam('user');
    const response = await api.get(`/users/${user.login}/starred`);
    this.setState({ stars: response.data, loading: false });
  }

  loadMore = async () => {
    const { navigation } = this.props;
    const { page, stars } = this.state;

    const user = navigation.getParam('user');
    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page: page + 1,
      },
    });
    this.setState({
      stars: [...stars, ...response.data],
      loading: false,
      page: page + 1,
    });
  };

  refreshList = async () => {
    const { navigation } = this.props;

    const user = navigation.getParam('user');
    const response = await api.get(`/users/${user.login}/starred`);
    this.setState({ stars: response.data });
  };

  handleRepository = item => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository: item });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, listRefreshing } = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading ? (
          <ActivityIndicator color="#7159c1" size="large" />
        ) : (
          <Stars
            onRefresh={this.refreshList}
            refreshing={listRefreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title onPress={() => this.handleRepository(item)}>
                    {item.name}
                  </Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
