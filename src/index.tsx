import * as React from 'react'
import { SafeAreaView, View, Dimensions, Animated, PanResponder } from 'react-native'
import data from './db'
import styles from './styles'

interface IState {
  cards: Array<{ id: number; color: string }>
  pan: Animated.ValueXY
}

const { height, width } = Dimensions.get('window')

class App extends React.Component<{}, IState> {
  state = {
    cards: data,
    pan: new Animated.ValueXY(),
  }

  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, { dx, dy }) => {
      this.state.pan.setValue({ x: dx, y: dy })
    },
    onPanResponderRelease: (event, { dx, dy }) => {
      const { pan } = this.state
      if (dx > 150) {
        // Swipe right
        Animated.timing(pan, {
          toValue: { x: width + 50, y: dy },
          useNativeDriver: true,
          duration: 350,
        }).start(() => {
          this.setState(
            ({ cards }) => {
              const withoutLast = cards.filter((card, index, array) => index !== array.length - 1)
              const last = cards[cards.length - 1]
              return { cards: [last, ...withoutLast] }
            },
            () => pan.setValue({ x: 0, y: 0 }),
          )
        })
      } else if (dx < -150) {
        // Swipe left
        Animated.timing(pan, {
          toValue: { x: -width - 50, y: dy },
          useNativeDriver: true,
          duration: 350,
        }).start(() => {
          this.setState(
            ({ cards }) => {
              const withoutFirst = cards.filter((card, index) => index !== 0)
              const first = cards[0]
              return { cards: [...withoutFirst, first] }
            },
            () => pan.setValue({ x: 0, y: 0 }),
          )
        })
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: true,
        }).start()
      }
    },
  })

  render() {
    const { cards, pan } = this.state
    return (
      <SafeAreaView style={styles.area}>
        <View style={styles.cardWrapper}>
          {cards.map((card) => {
            if (card.id === cards[0].id) {
              return (
                <Animated.View
                  {...this.panResponder.panHandlers}
                  key={card.id}
                  style={{
                    width,
                    height: height - 120,
                    padding: 10,
                    position: 'absolute',
                    transform: [
                      {
                        rotate: pan.x.interpolate({
                          inputRange: [-width / 2, 0, width / 2],
                          outputRange: ['-8deg', '0deg', '8deg'],
                          extrapolate: 'clamp',
                        }),
                      },
                      ...pan.getTranslateTransform(),
                    ],
                  }}
                >
                  <View
                    style={[
                      styles.cardContent,
                      {
                        backgroundColor: cards[0].color,
                      },
                    ]}
                  />
                </Animated.View>
              )
            }
          })}
        </View>
      </SafeAreaView>
    )
  }
}

export default App
