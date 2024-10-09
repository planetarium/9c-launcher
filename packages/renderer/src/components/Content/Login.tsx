import {TextField, Checkbox, Heading, Select, Flex, Button} from '@radix-ui/themes';
import {useForm} from '@tanstack/react-form';

export function Login() {
  const {Field, handleSubmit, state} = useForm({
    defaultValues: {
      planet: '',
      address: '',
      password: '',
    },
    onSubmit: async ({value}) => {
      // Handle form submission
      console.log(value);
    },
  });

  return (
    <>
      <Heading className="mb-6 text-3xl">Login</Heading>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Flex
          gap="4"
          direction="column"
          width="420px"
        >
          <Field
            name="planet"
            children={({state, handleChange, handleBlur}) => (
              <Select.Root
                size="3"
                defaultValue="0x000000000000"
              >
                <Select.Trigger
                  id="planet"
                  placeholder="Planet"
                />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Planets</Select.Label>
                    <Select.Item value="0x000000000000">Odin</Select.Item>
                    <Select.Item value="0x000000000001">Heimdall</Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            )}
          ></Field>

          <Field
            name="address"
            children={({state, handleChange, handleBlur}) => (
              <Select.Root
                size="3"
                defaultValue="0x3dfc24e309b4d5dc24f53fba70a3b97debca5ada"
              >
                <Select.Trigger placeholder="Nine Chronicles Address" />
                <Select.Content>
                  <Select.Group>
                    <Select.Label>Address</Select.Label>
                    <Select.Item value="0x3dfc24e309b4d5dc24f53fba70a3b97debca5ada">
                      0x3dfc24e309b4d5dc24f53fba70a3b97debca5ada
                    </Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            )}
          ></Field>

          <Field
            name="password"
            children={({state, handleChange, handleBlur}) => (
              <TextField.Root
                size="3"
                type="password"
                defaultValue={state.value}
                onChange={e => handleChange(e.target.value)}
                onBlur={handleBlur}
                placeholder="Passphrase"
              />
            )}
          />
          <div className="flex items-center justify-between mt-6S">
            <Button
              size="3"
              className="font-bold rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Sign In
            </Button>
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
        </Flex>
      </form>
    </>
  );
}
