import {Flex, Text} from '@radix-ui/themes';

export function BaseNodeInfo() {
  return (
    <Flex direction="column">
      <Text
        as="span"
        color="gray"
        size="1"
      >
        Player v200230
      </Text>
      <Text
        as="span"
        color="gray"
        size="1"
      >
        Launcher v3.0.0
      </Text>
      <Text
        size="2"
        weight="bold"
      >
        Node : heimdall-rpc-3-nine-chronicles.com
      </Text>
    </Flex>
  );
}
